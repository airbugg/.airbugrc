import {
  aNineToFiveInterval,
  anOverNightInterval,
  aScheduleWithLinkSchedule,
  aSimpleSchedule,
  aTwentyFourHoursDay,
} from '../../test/builders/rpc-custom/schedule-builder';
import { scheduleToWhoWorkings } from './scheduler-to-whos-working';
import { Chance } from 'chance';
import { DAYS_OF_WEEK } from './mappers/working-hours/working-hours-to-schedule-mapper';
import {
  Resource,
  Schedule,
} from '@wix/ambassador-services-catalog-server/rpc';
import { aResource } from '@wix/ambassador-resources-server/builders';
import { anInterval } from '@wix/ambassador-services-server/builders';
import { Day } from '@wix/ambassador-services-server/types';

describe('schedule list to who working view ', () => {
  const chance = new Chance();
  const businessSchedule = aSimpleSchedule([
    aTwentyFourHoursDay.bind(null, 'SUN'),
    aTwentyFourHoursDay.bind(null, 'MON'),
  ]);

  function mockResourceForSchedule(schedule: Schedule): Resource {
    return aResource()
      .withId(schedule.scheduleOwnerId)
      .withName(chance.name())
      .build();
  }

  function expectTwentyFourSeven(
    whoWorkings: any,
    twentyForeHourSevenSchedule: Schedule,
  ) {
    const sampleTwentyForeHourInterval =
      twentyForeHourSevenSchedule.intervals[0].interval;
    whoWorkings.forEach(dayOfWork => {
      expect(dayOfWork.workingHours.length).toBe(1);
      expect(dayOfWork.workingHours[0].staff.length).toBe(1);
      expect(dayOfWork.workingHours[0].staff[0].id).toEqual(
        twentyForeHourSevenSchedule.scheduleOwnerId,
      );
      expect(dayOfWork.workingHours[0].interval.startTime).toContain(
        `${sampleTwentyForeHourInterval.hourOfDay}:00`,
      );
      expect(dayOfWork.workingHours[0].interval.endTime).toContain(
        `${sampleTwentyForeHourInterval.hourOfDay}:00`,
      );
    });
  }

  it('one staff not working at all', () => {
    const simpleSchedule = aSimpleSchedule([]);
    const staffResource = mockResourceForSchedule(simpleSchedule);
    const whoWorkings = scheduleToWhoWorkings(
      [simpleSchedule],
      businessSchedule,
      60,
      [staffResource],
    );
    expect(whoWorkings.length).toBe(0);
  });
  it('2 staff not working at all', () => {
    const simpleSchedule1 = aSimpleSchedule([]);
    const simpleSchedule2 = aSimpleSchedule([]);
    const whoWorkings = scheduleToWhoWorkings(
      [simpleSchedule1, simpleSchedule2],
      businessSchedule,
      60,
      [],
    );
    expect(whoWorkings.length).toBe(0);
  });

  it('should convert a single staff', () => {
    const singleDayWorkWeek = 'SUN';
    const simpleSchedule = aSimpleSchedule([
      aNineToFiveInterval.bind(null, singleDayWorkWeek),
    ]);
    const staffResource = mockResourceForSchedule(simpleSchedule);

    const whoWorkings = scheduleToWhoWorkings(
      [simpleSchedule],
      businessSchedule,
      60,
      [staffResource],
    );
    expect(whoWorkings[0].day).toBe('sun');
    expect(whoWorkings[0].workingHours[0].staff[0]).toEqual({
      id: simpleSchedule.scheduleOwnerId,
      fullName: staffResource.name,
    });
    expect(whoWorkings[0].workingHours[0].interval.startTime).toContain('9:00');
    expect(whoWorkings[0].workingHours[0].interval.endTime).toContain('17:00');
  });

  it('should convert and merge staff with same working hours', () => {
    const singleDayWorkWeek = 'SUN';
    const simpleSchedule1 = aSimpleSchedule([
      aNineToFiveInterval.bind(null, singleDayWorkWeek),
    ]);
    const simpleSchedule2 = aSimpleSchedule([
      aNineToFiveInterval.bind(null, singleDayWorkWeek),
    ]);
    const staffResources = [simpleSchedule1, simpleSchedule2].map(
      mockResourceForSchedule,
    );
    const whoWorkings = scheduleToWhoWorkings(
      [simpleSchedule1, simpleSchedule2],
      businessSchedule,
      60,
      staffResources,
    );
    expect(whoWorkings[0].day).toBe('sun');
    expect(whoWorkings[0].workingHours[0].staff.length).toBe(2);
    expect(whoWorkings[0].workingHours[0].interval.startTime).toContain('9:00');
    expect(whoWorkings[0].workingHours[0].interval.endTime).toContain('17:00');
  });

  it('should remove interval too short', () => {
    const schedule = aSimpleSchedule([
      () =>
        anInterval()
          .withDaysOfWeek(Day.SUN)
          .withHourOfDay(2)
          .withMinuteOfHour(0)
          .withDuration(10)
          .build(),
    ]);
    const staffResource = mockResourceForSchedule(schedule);

    const whoWorkings = scheduleToWhoWorkings(
      [schedule],
      businessSchedule,
      60,
      [staffResource],
    );
    expect(whoWorkings.length).toBe(0);
  });

  it('should switch single ', () => {
    const schedule = aSimpleSchedule([
      () =>
        anInterval()
          .withDaysOfWeek(Day.SUN)
          .withHourOfDay(2)
          .withMinuteOfHour(0)
          .withDuration(60 * 23)
          .build(),
    ]);
    const staffResource = mockResourceForSchedule(schedule);

    const whoWorkings = scheduleToWhoWorkings(
      [schedule],
      businessSchedule,
      20,
      [staffResource],
    );
    expect(whoWorkings[0].workingHours[0].interval.startTime).toContain('2:00');
    expect(whoWorkings[0].workingHours[0].interval.endTime).toContain('1:00');
  });

  it('should merge interval and split by staff', () => {
    const singleDay = 'SUN';
    const twentyForeHourSchedule = aSimpleSchedule([
      aTwentyFourHoursDay.bind(null, singleDay),
    ]);
    const nineToFiveSchedule = aSimpleSchedule([
      aNineToFiveInterval.bind(null, singleDay),
    ]);
    const nineToFiveResource = mockResourceForSchedule(nineToFiveSchedule);
    const twentyFourHourResource = mockResourceForSchedule(
      twentyForeHourSchedule,
    );
    const resources = [nineToFiveResource, twentyFourHourResource];
    const whoWorkings = scheduleToWhoWorkings(
      [nineToFiveSchedule, twentyForeHourSchedule],
      businessSchedule,
      20,
      resources,
    );
    expect(whoWorkings[0].workingHours.length).toBe(3);
    expect(whoWorkings[0].workingHours[0].interval.startTime).toContain(
      twentyForeHourSchedule.intervals[0].interval.hourOfDay,
    );
    expect(whoWorkings[0].workingHours[0].interval.endTime).toContain('9:00');
    expect(whoWorkings[0].workingHours[0].staff).toEqual([
      {
        id: twentyForeHourSchedule.scheduleOwnerId,
        fullName: twentyFourHourResource.name,
      },
    ]);
    expect(whoWorkings[0].workingHours[1].interval.startTime).toContain('9:00');
    expect(whoWorkings[0].workingHours[1].interval.endTime).toContain('17:00');
    expect(whoWorkings[0].workingHours[1].staff[0]).toEqual({
      id: nineToFiveSchedule.scheduleOwnerId,
      fullName: nineToFiveResource.name,
    });
    expect(whoWorkings[0].workingHours[1].staff[1]).toEqual({
      id: twentyForeHourSchedule.scheduleOwnerId,
      fullName: twentyFourHourResource.name,
    });

    expect(whoWorkings[0].workingHours[2].interval.startTime).toContain(
      '17:00',
    );
    expect(whoWorkings[0].workingHours[2].interval.endTime).toContain(
      `${twentyForeHourSchedule.intervals[0].interval.hourOfDay}:00`,
    );
    expect(whoWorkings[0].workingHours[2].staff).toEqual([
      {
        id: twentyForeHourSchedule.scheduleOwnerId,
        fullName: twentyFourHourResource.name,
      },
    ]);
  });

  it('work 24/7 will still have interval every day', () => {
    const twentyForeHourSevenSchedule = aSimpleSchedule(
      DAYS_OF_WEEK.map(dayOfTheWeek => {
        return aTwentyFourHoursDay.bind(null, dayOfTheWeek);
      }),
    );
    const resources = [mockResourceForSchedule(twentyForeHourSevenSchedule)];
    const whoWorkings = scheduleToWhoWorkings(
      [twentyForeHourSevenSchedule],
      businessSchedule,
      20,
      resources,
    );
    expect(whoWorkings.length).toBe(DAYS_OF_WEEK.length);
    expectTwentyFourSeven(whoWorkings, twentyForeHourSevenSchedule);
  });
  it('allow more then 24 hours service duration', () => {
    const twentyForeHourSevenSchedule = aSimpleSchedule(
      DAYS_OF_WEEK.map(dayOfTheWeek => {
        return aTwentyFourHoursDay.bind(null, dayOfTheWeek);
      }),
    );
    const resources = [mockResourceForSchedule(twentyForeHourSevenSchedule)];
    const whoWorkings = scheduleToWhoWorkings(
      [twentyForeHourSevenSchedule],
      businessSchedule,
      60 * 25,
      resources,
    );
    expect(whoWorkings.length).toBe(DAYS_OF_WEEK.length);
    expectTwentyFourSeven(whoWorkings, twentyForeHourSevenSchedule);
  });

  it('1 staff with one day of working 24 hours on tue and leaping till next day', () => {
    const intervalsFactory = [];
    intervalsFactory.push(aNineToFiveInterval.bind(null, 'TUE'));
    const builder = anInterval()
      .withDaysOfWeek(Day.TUE)
      .withHourOfDay(16)
      .withMinuteOfHour(23)
      .withDuration(22 * 60);
    intervalsFactory.push(builder.build.bind(builder, 'TUE'));
    intervalsFactory.push(anOverNightInterval.bind(null, 'TUE'));
    //9:00 - 17:00
    //16:23 - next day 12:00
    //23:30 - next day 8:30
    const schedule = aSimpleSchedule(intervalsFactory);
    const staffResource = mockResourceForSchedule(schedule);
    const whoWorkings = scheduleToWhoWorkings(
      [schedule],
      businessSchedule,
      60,
      [staffResource],
    );
    expect(whoWorkings[0].day).toBe('tue');
    expect(whoWorkings[0].workingHours[0].interval.startTime).toContain(`9:00`);
    expect(whoWorkings[0].workingHours[0].interval.endTime).toContain(`9:00`);
    expect(whoWorkings[0].workingHours[0].staff).toEqual([
      { id: schedule.scheduleOwnerId, fullName: staffResource.name },
    ]);

    expect(whoWorkings[1].day).toBe('wed');
    expect(whoWorkings[1].workingHours[0].interval.startTime).toContain(`9:00`);
    expect(whoWorkings[1].workingHours[0].interval.endTime).toContain(`14:23`);
    expect(whoWorkings[1].workingHours[0].staff).toEqual([
      { id: schedule.scheduleOwnerId, fullName: staffResource.name },
    ]);
  });

  it('service with 25 hours duration sunday to monday', () => {
    const schedule = aSimpleSchedule([
      aTwentyFourHoursDay.bind(null, 'SUN'),
      aTwentyFourHoursDay.bind(null, 'MON'),
    ]);
    const resources = [mockResourceForSchedule(schedule)];
    const duration = 25 * 60;
    const whoWorkings = scheduleToWhoWorkings(
      [schedule],
      businessSchedule,
      duration,
      resources,
    );
    expect(whoWorkings[0].day).toBe('sun');
  });

  it('should use the business schedule when staff has likened schedule to the owner', () => {
    const scheduleThatLinked = aScheduleWithLinkSchedule(businessSchedule);
    const resources = [mockResourceForSchedule(scheduleThatLinked)];
    const duration = 60;
    const whoWorkings = scheduleToWhoWorkings(
      [scheduleThatLinked],
      businessSchedule,
      duration,
      resources,
    );
    expect(whoWorkings[0].day).toBe('sun');
  });
});
