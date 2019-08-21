/*
  https://www.wix.com/_api/scheduler-server/owner/classes/inst/
{
  "location":"BUSINESS",
  "name":"Test appoitment",
  "locationText":"",
  "isFree":false,
  "currency":"USD",
  "capacity":50,
  "classProtoId":"f778a61c-7a0b-435b-ad6d-f5e176acb72e",
  "staffMemberId":"0de7e6d4-8488-48b2-b085-bc46a367de64",
  "notes":"asdfasdf",
  "classDate":"2019-02-28",
  "classTime":"13:00:00.000"
}
 */
import { Chance } from 'chance';
import axios from 'axios';
import { aCreateSessionResponse } from '@wix/ambassador-schedule-server/builders';
import {
  aResource,
  aListResourcesResponse,
} from '@wix/ambassador-resources-server/builders';
import {
  aGetServiceResponse,
  aService,
} from '@wix/ambassador-services-catalog-server/builders';
import {
  aNineToFiveInterval,
  aSimpleSchedule,
} from '../../builders/rpc-custom/schedule-builder';
import { validCreateClassSession } from '../../builders/dto/create-class.dto.builder';
import { ResourcesServer } from '@wix/ambassador-resources-server/rpc';
import {
  DeleteSessionRequest,
  ScheduleServer,
} from '@wix/ambassador-schedule-server/rpc';
import { ServicesCatalogServer } from '@wix/ambassador-services-catalog-server/rpc';

const chance = Chance();

const mockSessionDeletion = onDelete => {
  ambassadorServer
    .createStub(ScheduleServer)
    .Schedules()
    .deleteSession.when(() => true)
    .call(onDelete);
};

describe('CRUD on Sessions', () => {
  it('should create a diverge class', async () => {
    const scheduleServer = ambassadorServer.createStub(ScheduleServer);
    const servicesCatalogServer = ambassadorServer.createStub(
      ServicesCatalogServer,
    );
    const resourcesServer = ambassadorServer.createStub(ResourcesServer);
    const classSession = validCreateClassSession();

    const serviceId = chance.guid();

    const serviceSchedule = aSimpleSchedule([
      aNineToFiveInterval.bind(null, 'SUN'),
    ]);
    serviceSchedule.id = serviceId;
    const resources = aResource()
      .withSchedules([aSimpleSchedule([aNineToFiveInterval.bind(null, 'SUN')])])
      .withId(classSession.staffMemberId)
      .build();
    const service = aService()
      .withScheduleIds([serviceSchedule.id])
      .build();
    const getServiceResponse = aGetServiceResponse()
      .withSchedules([serviceSchedule])
      .withService(service)
      .withResources([resources])
      .build();
    resourcesServer
      .ResourcesService()
      .list.when(() => true)
      .resolve(
        aListResourcesResponse()
          .withResources([aResource().build()])
          .build(),
      );
    servicesCatalogServer
      .ServicesCatalog()
      .get.when(() => true)
      .resolve(getServiceResponse);

    scheduleServer
      .Schedules()
      .createSession.when(() => true)
      .resolve(aCreateSessionResponse().build());

    const res = await axios.post(
      app.getUrl('/owner/classes/inst'),
      classSession,
    );
    expect(classSession).toBeDefined();
  });

  it('should update a diverge class', async () => {
    const scheduleServer = ambassadorServer.createStub(ScheduleServer);
    const servicesCatalogServer = ambassadorServer.createStub(
      ServicesCatalogServer,
    );
    const resourcesServer = ambassadorServer.createStub(ResourcesServer);
    const classSession = validCreateClassSession();

    const serviceId = chance.guid();

    const serviceSchedule = aSimpleSchedule([
      aNineToFiveInterval.bind(null, 'SUN'),
    ]);
    serviceSchedule.id = serviceId;
    const resources = aResource()
      .withSchedules([aSimpleSchedule([aNineToFiveInterval.bind(null, 'SUN')])])
      .withId(classSession.staffMemberId)
      .build();
    const service = aService()
      .withScheduleIds([serviceSchedule.id])
      .build();
    const getServiceResponse = aGetServiceResponse()
      .withSchedules([serviceSchedule])
      .withService(service)
      .withResources([resources])
      .build();
    resourcesServer
      .ResourcesService()
      .list.when(() => true)
      .resolve(
        aListResourcesResponse()
          .withResources([aResource().build()])
          .build(),
      );
    servicesCatalogServer
      .ServicesCatalog()
      .get.when(() => true)
      .resolve(getServiceResponse);

    scheduleServer
      .Schedules()
      .updateSession.when(() => true)
      .resolve(aCreateSessionResponse().build());

    const res = await axios.put(
      app.getUrl('/owner/classes/inst'),
      classSession,
    );
    expect(classSession).toBeDefined();
  });

  xit('create a course session', () => {});

  xit('update a course session', () => {});

  xit('delete a course session', async () => {
    const onDelete = jest.fn();
    mockSessionDeletion(onDelete);
    const sessionId = chance.string();

    const res = await axios.delete(app.getUrl(`/owner/sessions/${sessionId}`));
    expect(onDelete).toHaveBeenCalled();
  });

  xit('create a blocked session', () => {});

  xit('update a blocked session', () => {});

  xit('delete a blocked session', async () => {
    const onDelete = jest.fn();
    mockSessionDeletion(onDelete);
    const sessionId = chance.string();

    const res = await axios.delete(
      app.getUrl(`/owner/personalAppointments/${sessionId}`),
    );
    expect(onDelete).toHaveBeenCalled();
  });

  xit('update an individual session', () => {});

  it('delete an class session', async () => {
    const onDelete = jest.fn();
    mockSessionDeletion(onDelete);
    const sessionId = chance.guid();
    const notifyUsers = chance.bool();
    const expectedDeleteRequest: DeleteSessionRequest = {
      notifyParticipants: notifyUsers,
      id: sessionId,
    };

    const res = await axios.delete(
      app.getUrl(
        `/owner/classes/inst/${sessionId}/?notifyUsers=${notifyUsers}`,
      ),
    );
    expect(onDelete).toHaveBeenCalledWith(expectedDeleteRequest);
  });
});
