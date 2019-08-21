import {
  aCalendarDateTime,
  aLocation,
  aParticipant,
  aSession,
} from '@wix/ambassador-calendar-server/builders';

import { aSchedule } from '@wix/ambassador-schedule-server/builders';

import { Chance } from 'chance';
import {
  LocationTypes,
  OfferingTypes,
} from '../../../dto/offerings/offerings.consts';
import {
  BLOCKED_OFFERING_ID,
  convertSessionToCalendarItem,
  SessionOffering,
} from './sessions-to-calendar';
import { CalendarItemType } from '../../../dto/sessions/session.dto';
import { LocationType } from '@wix/ambassador-calendar-server/types';

describe('session to calendar item', () => {
  const chance = new Chance();

  beforeEach(() => {});

  const aSessionOffering = (): SessionOffering => ({
    id: chance.guid(),
    name: chance.sentence(),
    uouHidden: chance.bool(),
  });

  const staffId = chance.guid();

  it('with id, type, start and end', () => {
    const sessionId = chance.guid();
    const start = chance.timestamp();
    const end = chance.timestamp();
    const session = aSession()
      .withId(sessionId)
      .withTags([OfferingTypes.INDIVIDUAL])
      .withStart(
        aCalendarDateTime()
          .withTimestamp(start)
          .build(),
      )
      .withEnd({ timestamp: end })
      .build();

    const calendarItem = convertSessionToCalendarItem(
      session,
      aSessionOffering(),
      staffId,
    );
    expect(calendarItem.id).toBe(sessionId);
    expect(calendarItem.type).toBe(CalendarItemType.Individual);
    expect(calendarItem.startTime).toBe(+start);
    expect(calendarItem.endTime).toBe(+end);
  });
  it('should map customer Id in the origin b object', () => {
    const someContactId = chance.guid();
    const session = aSession()
      .withParticipants([
        aParticipant()
          .withContactId(someContactId)
          .build(),
      ])
      .build();

    const calendarItem = convertSessionToCalendarItem(
      session,
      aSessionOffering(),
      staffId,
    );
    expect(calendarItem.origin.contactId).toBe(someContactId);
  });

  it('with group type', () => {
    const session = aSession()
      .withTags([OfferingTypes.GROUP])
      .build();

    const calendarItem = convertSessionToCalendarItem(
      session,
      aSessionOffering(),
      staffId,
    );
    expect(calendarItem.type).toBe(CalendarItemType.Group);
  });

  it('with registered participants', () => {
    const registeredParticipants = chance.integer({ min: 1, max: 30 });
    const session = aSession()
      .withTotalNumberOfParticipants(registeredParticipants)
      .build();

    const calendarItem = convertSessionToCalendarItem(
      session,
      aSessionOffering(),
      staffId,
    );
    expect(calendarItem.registeredParticipants).toBe(registeredParticipants);
  });

  it('with capacity', () => {
    const capacity = chance.integer({ min: 1, max: 30 });
    const session = aSession()
      .withCapacity(capacity)
      .build();

    const calendarItem = convertSessionToCalendarItem(
      session,
      aSessionOffering(),
      staffId,
    );
    expect(calendarItem.participantsCapacity).toBe(capacity);
  });

  it('with uouHidden, offeringId, offeringName', () => {
    const uouHidden = true;
    const id = chance.guid();
    const name = chance.name();

    const offering = {
      id,
      name,
      uouHidden,
    };
    const session = aSession()
      .withTitle(name)
      .build();
    const calendarItem = convertSessionToCalendarItem(
      session,
      offering,
      staffId,
    );
    expect(calendarItem.offeringId).toBe(id);
    expect(calendarItem.offeringName).toBe(name);
    expect(calendarItem.uouHidden).toBe(uouHidden);
  });

  it('with staffId', () => {
    const sessionStaffId = chance.guid();
    const session = aSession().build();
    const calendarItem = convertSessionToCalendarItem(
      session,
      aSessionOffering(),
      sessionStaffId,
    );
    expect(calendarItem.staffId).toBe(sessionStaffId);
  });

  describe('with location', () => {
    it('business', () => {
      const location = aLocation()
        .withAddress(chance.address())
        .withLocationType(LocationType.OWNER_BUSINESS);

      const session = aSession()
        .withLocation(location.build())
        .build();
      const calendarItem = convertSessionToCalendarItem(
        session,
        aSessionOffering(),
        staffId,
      );

      expect(calendarItem.locationType).toBe(LocationTypes.BUSINESS);
      expect(calendarItem.formattedLocation).toBe(session.location.address);
    });

    it('owner custom', () => {
      const location = aLocation()
        .withAddress(chance.address())
        .withLocationType(LocationType.OWNER_CUSTOM);

      const session = aSession()
        .withLocation(location.build())
        .build();
      const calendarItem = convertSessionToCalendarItem(
        session,
        aSessionOffering(),
        staffId,
      );

      expect(calendarItem.locationType).toBe(LocationTypes.OTHER);
      expect(calendarItem.formattedLocation).toBe(session.location.address);
    });

    it('customer', () => {
      const location = aLocation()
        .withAddress(chance.address())
        .withLocationType(LocationType.CUSTOM);

      const session = aSession()
        .withLocation(location.build())
        .build();
      const calendarItem = convertSessionToCalendarItem(
        session,
        aSessionOffering(),
        staffId,
      );

      expect(calendarItem.locationType).toBe(LocationTypes.CUSTOMER);
      expect(calendarItem.formattedLocation).toBe(session.location.address);
    });

    it('course total number of participants comes from schedule', () => {
      const scheduleId = 'scheduleId';
      const totalNumberOfParticipants = chance.integer({ min: 1, max: 10 });
      const schedules = new Map();
      schedules[scheduleId] = aSchedule()
        .withId(scheduleId)
        .withTotalNumberOfParticipants(totalNumberOfParticipants);

      const session = aSession()
        .withScheduleId(scheduleId)
        .withTags([OfferingTypes.COURSE])
        .build();
      const calendarItem = convertSessionToCalendarItem(
        session,
        aSessionOffering(),
        staffId,
        schedules,
      );

      expect(calendarItem.origin.numOfParticipants).toBe(
        totalNumberOfParticipants,
      );
    });

    it('shows google sessions', () => {
      const session = aSession()
        .withTags([CalendarItemType.Google.toLocaleLowerCase()])
        .withScheduleOwnerId(staffId)
        .build();
      const calendarItem = convertSessionToCalendarItem(
        session,
        aSessionOffering(),
        staffId,
      );

      expect(calendarItem.type).toBe(CalendarItemType.Google);
    });

    it('has blocked offering id when tagged as blocked', () => {
      const session = aSession()
        .withTags([CalendarItemType.Blocked])
        .withScheduleOwnerId(staffId)
        .build();

      const calendarItem = convertSessionToCalendarItem(
        session,
        aSessionOffering(),
        staffId,
      );

      expect(calendarItem.offeringId).toBe(BLOCKED_OFFERING_ID);
    });
  });
});
