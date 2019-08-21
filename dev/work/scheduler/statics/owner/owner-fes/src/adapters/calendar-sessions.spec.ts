import {
  CreateSessionRequest,
  CreateSessionResponse,
  LocalDateTime,
  Session,
} from '@wix/ambassador-schedule-server/rpc';
import { aSession } from '@wix/ambassador-schedule-server/builders';
import {
  createOrUpdateASessionFromDivergeClass,
  getSessionPosition,
} from './calendar-sessions';
import * as moment from 'moment';

import { validCreateClassSession } from '../../test/builders/dto/create-class.dto.builder';
import {
  aNineToFiveInterval,
  aSimpleSchedule,
} from '../../test/builders/rpc-custom/schedule-builder';

import * as Chance from 'chance';
import { aGetServiceResponse } from '@wix/ambassador-services-catalog-server/builders';
import { GetServiceResponse } from '@wix/ambassador-services-catalog-server/rpc';
import {
  aListResourcesResponse,
  aResource,
} from '@wix/ambassador-resources-server/builders';
import { aSchedule, aService } from '@wix/ambassador-services-server/builders';

describe('calendar session', () => {
  const chance = new Chance();

  function staffResource(staffId: string) {
    return aResource()
      .withSchedules([aSimpleSchedule([aNineToFiveInterval.bind(null, 'SUN')])])
      .withId(staffId)
      .build();
  }

  function getSessionsListAndValues(sessionId) {
    const count = chance.integer({ min: 10, max: 10 });
    const order = chance.integer({ min: 1, max: 9 });
    const sessionsList = [];

    for (let i = 0; i < count; i++) {
      let currSessionId = chance.guid();
      if (i === order - 1) {
        currSessionId = sessionId;
      }

      sessionsList.push(
        aSession()
          .withId(currSessionId)
          .withStart({ timestamp: `${i}` })
          .build(),
      );
    }

    return { sessionsList, order };
  }

  it('should get session position', async () => {
    const sessionId = 'sessionId';
    const session = aSession()
      .withId(sessionId)
      .build();
    const schedule = aSchedule().build();
    const { sessionsList, order } = getSessionsListAndValues(sessionId);
    const sessionPosition = await getSessionPosition(
      sessionId,
      id =>
        Promise.resolve({
          session,
        }),
      id => Promise.resolve({ schedule }),
      id => Promise.resolve({ sessions: sessionsList }),
    );

    expect(sessionPosition.total).toBe(sessionsList.length + 1);
    expect(sessionPosition.num).toBe(+order + 1);
  });

  describe('class session', () => {
    it('should create a session from class instance', async () => {
      let requestedId;
      let sessionForReaction: Session;

      let createScheduleResponse: GetServiceResponse;
      const classSession = validCreateClassSession();
      const staff = staffResource(classSession.staffMemberId);
      const mockOfGetterOfServiceById = async (
        id: string,
      ): Promise<GetServiceResponse> => {
        requestedId = id;
        const resource = aResource()
          .withSchedules([
            aSimpleSchedule([aNineToFiveInterval.bind(null, 'SUN')]),
          ])
          .build();
        return new Promise<GetServiceResponse>(resolve => {
          createScheduleResponse = aGetServiceResponse()
            .withResources([resource])
            .withService(
              aService()
                .withId(id)
                .build(),
            )
            .withSchedules([
              aSimpleSchedule([aNineToFiveInterval.bind(null, 'SUN')]),
            ])
            .build();
          return resolve(createScheduleResponse);
        });
      };

      const mockOfCreatorOfSession = async (
        req: CreateSessionRequest,
      ): Promise<CreateSessionResponse> => {
        sessionForReaction = req.session;
        return new Promise(resolve => {
          return resolve(req.session);
        });
      };

      const res: CreateSessionResponse = await createOrUpdateASessionFromDivergeClass(
        classSession,
        mockOfCreatorOfSession,
        mockOfGetterOfServiceById,
        async () =>
          aListResourcesResponse()
            .withResources([staff])
            .build(),
      );
      expect(requestedId).toBe(classSession.classProtoId);
      //location
      expect(sessionForReaction.location.locationType).toBe('OWNER_CUSTOM');
      expect(sessionForReaction.location.address).toBe(
        classSession.locationText,
      );

      //affected Schedules
      expect(sessionForReaction.affectedSchedules[0].scheduleOwnerId).toBe(
        classSession.staffMemberId,
      );
      expect(sessionForReaction.affectedSchedules[0].transparency).toBe('BUSY');
      expect(sessionForReaction.affectedSchedules[0].scheduleId).toBe(
        staff.schedules[0].id,
      );

      expect(sessionForReaction.capacity).toBe(classSession.capacity);

      const startTimeMoment = moment(
        classSession.classDate + ' ' + classSession.classTime,
        'YYYY-MM-DD HH:mm:ss.SSS',
      );
      const expectedStartTime: LocalDateTime = {
        hourOfDay: startTimeMoment.hours(),
        dayOfMonth: startTimeMoment.date(),
        year: startTimeMoment.year(),
        monthOfYear: startTimeMoment.month() + 1,
        minutesOfHour: startTimeMoment.minute(),
      };
      expect(sessionForReaction.start.localDateTime).toEqual(expectedStartTime);

      const endTimeMoment = moment(
        classSession.classDate + ' ' + classSession.classTime,
        'YYYY-MM-DD HH:mm:ss.SSS',
      ).add(8, 'h');
      const expectedEndTime: LocalDateTime = {
        hourOfDay: endTimeMoment.hour(),
        dayOfMonth: endTimeMoment.date(),
        year: endTimeMoment.year(),
        monthOfYear: endTimeMoment.month() + 1,
        minutesOfHour: endTimeMoment.minute(),
      };
      expect(sessionForReaction.end.localDateTime).toEqual(expectedEndTime);

      expect(sessionForReaction.notes).toBe(classSession.notes);
    });
  });
});
