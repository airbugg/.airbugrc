import { Days } from '../../../../dto/offerings/working-days.dto';
import { DAYS_OF_WEEK } from '../../working-hours/working-hours-to-schedule-mapper';
import { Chance } from 'chance';
import { convertClassHoursToRecurringIntervals } from './class-hours-to-reccuring-intervals';

const HOUR_IN_MINUTES = 60;
const DAY_IN_MINUTES = 24 * 60;
describe('classhours to reccuring intervals', () => {
  const chance = new Chance();
  const timezone = 'Etc/UTC';
  const oneDayOneHour = (
    day = 'mon',
    hour = 10,
    minute = 0,
    staffId = 'staffId',
    id = 'id',
  ) => {
    return {
      [day]: {
        workingHours: [getHour(hour, minute, staffId, id)],
      },
    };
  };

  const oneDayOneHourWithStaff = staffId => {
    const day = oneDayOneHour();
    day.mon.workingHours[0].staffId = staffId;
    return day;
  };

  const oneDayTwoIntervalsOfOneHour = (
    day,
    hours,
    minutes,
    staffId = 'staffId',
    id = 'id',
  ) => ({
    [day]: {
      workingHours: [
        getHour(hours[0], minutes[0], staffId, id),
        getHour(hours[1], minutes[1], staffId, id),
      ],
    },
  });

  function startTimeEqualsEndTime() {
    return {
      mon: {
        workingHours: [
          {
            workingHour: {
              startTime: `09:00:00.000`,
              endTime: `09:00:00.000`,
            },
            teacher: null,
            staffId: 'staffId',
            id: 'id',
          },
        ],
      },
    };
  }

  const getHour = (hour, minute, staffId = 'staffId', id = 'id') => ({
    workingHour: {
      startTime: `${getTime(hour)}:${getTime(minute)}:00.000`,
      endTime: `${getTime(++hour)}:${getTime(minute)}:00.000`,
    },
    teacher: null,
    staffId,
    id,
  });

  function getTime(time: number) {
    return `0${time}`.slice(-2);
  }

  function callConvertClassHoursToRecurringIntervals(days, staffList = []) {
    return convertClassHoursToRecurringIntervals(
      days,
      staffList,
      new Date().toISOString().slice(0, 10),
      new Date().toISOString().slice(0, 10),
      timezone,
      60,
    );
  }

  function callConvertClassHoursToRecurringIntervalsWithoutDuration(
    days,
    staffList = [],
  ) {
    return convertClassHoursToRecurringIntervals(
      days,
      staffList,
      new Date().toISOString().slice(0, 10),
      new Date().toISOString().slice(0, 10),
      timezone,
    );
  }

  function callConvertClassHoursToRecurringIntervalsWithRepetition(
    days,
    repetition,
    staffList = [],
  ) {
    return convertClassHoursToRecurringIntervals(
      days,
      staffList,
      new Date().toISOString().slice(0, 10),
      new Date().toISOString().slice(0, 10),
      timezone,
      null,
      repetition,
    );
  }

  function expectIntervalIsDay(recuringInterval, dayOfTheWeek, hour, minute) {
    expect(recuringInterval.interval.daysOfWeek).toBe(
      dayOfTheWeek.toUpperCase(),
    );
    expect(recuringInterval.interval.hourOfDay).toBe(hour);
    expect(recuringInterval.interval.minuteOfHour).toBe(minute);
  }

  it('should convert one day one hour', () => {
    const hour = chance.integer({ min: 0, max: 22 });
    const minute = chance.integer({ min: 0, max: 59 });
    const dayOfTheWeekIndex = chance.integer({ min: 0, max: 6 });
    const dayOfTheWeek = DAYS_OF_WEEK[dayOfTheWeekIndex];
    const days: Days = oneDayOneHour(dayOfTheWeek, hour, minute);

    const recuringIntervals = callConvertClassHoursToRecurringIntervals(days);
    expectIntervalIsDay(recuringIntervals[0], dayOfTheWeek, hour, minute);
  });

  it('should convert one day with 2 intervals', () => {
    const hours = [
      chance.integer({ min: 0, max: 11 }),
      chance.integer({ min: 12, max: 22 }),
    ];
    const minutes = [
      chance.integer({ min: 0, max: 59 }),
      chance.integer({ min: 0, max: 59 }),
    ];
    const dayOfTheWeekIndex = chance.integer({ min: 0, max: 6 });

    const days = oneDayTwoIntervalsOfOneHour(
      DAYS_OF_WEEK[dayOfTheWeekIndex],
      hours,
      minutes,
    );

    const recuringIntervals = callConvertClassHoursToRecurringIntervals(days);

    recuringIntervals.forEach((interval, index) => {
      expectIntervalIsDay(
        interval,
        DAYS_OF_WEEK[dayOfTheWeekIndex],
        hours[index],
        minutes[index],
      );
    });
  });

  it('should convert 2 days with 2 intervals', () => {
    const hours = [
      chance.integer({ min: 0, max: 22 }),
      chance.integer({ min: 0, max: 22 }),
    ];
    const minutes = [
      chance.integer({ min: 0, max: 59 }),
      chance.integer({ min: 0, max: 59 }),
    ];
    const dayOfTheWeekIndex = [
      chance.integer({ min: 0, max: 3 }),
      chance.integer({ min: 4, max: 6 }),
    ];

    const days = {
      ...oneDayOneHour(
        DAYS_OF_WEEK[dayOfTheWeekIndex[0]],
        hours[0],
        minutes[0],
      ),
      ...oneDayOneHour(
        DAYS_OF_WEEK[dayOfTheWeekIndex[1]],
        hours[1],
        minutes[1],
      ),
    };

    const recuringIntervals = callConvertClassHoursToRecurringIntervals(days);

    recuringIntervals.forEach((interval, index) => {
      expectIntervalIsDay(
        interval,
        DAYS_OF_WEEK[dayOfTheWeekIndex[index]],
        hours[index],
        minutes[index],
      );
    });
  });

  it('with one staff member', () => {
    const staffId = chance.guid();
    const days = oneDayOneHourWithStaff(staffId);
    const scheduleId = 'scheduleId';
    const staffLinkedSchedule = { scheduleId, scheduleOwnerId: staffId };

    const extraStaffLinkedSchedule = {
      scheduleId: chance.guid(),
      scheduleOwnerId: chance.guid(),
    };

    const recuringIntervals = callConvertClassHoursToRecurringIntervals(days, [
      extraStaffLinkedSchedule,
      staffLinkedSchedule,
    ]);

    expect(recuringIntervals[0].affectedSchedules).toEqual([
      staffLinkedSchedule,
    ]);
  });

  it('duration is 24 hours', () => {
    const days = startTimeEqualsEndTime();

    const recuringIntervals = callConvertClassHoursToRecurringIntervalsWithoutDuration(
      days,
    );

    expect(recuringIntervals[0].interval.duration).toEqual(DAY_IN_MINUTES);
  });

  it('with repetitions', () => {
    const days = oneDayOneHour();
    const repetition = chance.integer({ min: 1, max: 10 });

    const recuringIntervals = callConvertClassHoursToRecurringIntervalsWithRepetition(
      days,
      repetition,
    );

    expect(recuringIntervals[0].frequency.repetition).toEqual(repetition);
  });

  it('çwith start date and end date', () => {
    const days = {};
    const staffList = [];
    const start = '2019-02-27';
    const end = '2020-02-27';

    const intervals = convertClassHoursToRecurringIntervals(
      oneDayOneHour('mon', 10, 24),
      [],
      start,
      end,
      timezone,
      HOUR_IN_MINUTES,
    );

    expect(intervals[0].start).toBe('2019-02-27T00:00:00.000Z');
    expect(intervals[0].end).toBe('2020-02-27T23:59:59.999Z');
  });

  it('create with start date and end date and non UTC timezone', () => {
    const start = '2019-02-27';
    const end = '2020-02-27';
    const laTimezone = 'America/Los_Angeles';

    const intervals = convertClassHoursToRecurringIntervals(
      oneDayOneHour('mon', 10, 24),
      [],
      start,
      end,
      laTimezone,
      HOUR_IN_MINUTES,
    );

    expect(intervals[0].start).toBe('2019-02-27T08:00:00.000Z');
    expect(intervals[0].end).toBe('2020-02-28T07:59:59.999Z');
  });

  it('when start time is not zero padded', () => {
    const days = {
      mon: {
        workingHours: [
          {
            workingHour: {
              startTime: '9:00',
              endTime: '08:00:00.000',
            },
            staffId: 'd8211825-a80d-4f5f-b73a-ff3ef15b9ebb',
          },
        ],
      },
    };

    const intervals = callConvertClassHoursToRecurringIntervalsWithoutDuration(
      days,
    );
    expect(intervals[0].interval.duration).toBe(23 * 60);
    expect(intervals[0].interval.hourOfDay).toBe(9);
  });
});
