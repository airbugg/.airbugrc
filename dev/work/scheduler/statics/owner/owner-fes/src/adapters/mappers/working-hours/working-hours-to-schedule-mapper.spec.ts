import {
  DAYS_OF_WEEK,
  mapWorkingHoursToSchedule,
} from './working-hours-to-schedule-mapper';
import { RecurringInterval } from '@wix/ambassador-resources-server/rpc';
import { WorkingHoursDto } from '../../../dto/working-hours.dto';

describe('WorkingHoursToScheduleT', () => {
  function nineToFive() {
    return { startTime: '9:00:00.00', endTime: '17:00:00.00' };
  }

  function createANineToFiveWorkingHours(): WorkingHoursDto {
    const workingHours: any = {};
    DAYS_OF_WEEK.forEach(day => {
      workingHours[day] = [nineToFive()];
    });
    return workingHours;
  }

  function overNight() {
    return { startTime: '22:00:00.000', endTime: '02:00:00.000' };
  }

  function createALeapWorkingHours() {
    const workingHours: any = {};
    DAYS_OF_WEEK.forEach(day => {
      workingHours[day] = [overNight()];
    });
    return workingHours;
  }

  function create2WorkingIntervals() {
    const workingHours: any = {};
    DAYS_OF_WEEK.forEach(day => {
      workingHours[day] = [overNight(), nineToFive()];
    });
    return workingHours;
  }
  const timezone = 'Etc/UTC';
  // declare type IntervalFactory: ()=>: string
  //
  // function workingIntervals(IntervalsFactory: IntervalFactory[]): any {
  //
  // }

  it('should convert sun 9-17 to scheduler', () => {
    const workingHours = createANineToFiveWorkingHours();
    const intervalsInWeekDay = new Map<string, boolean>();
    DAYS_OF_WEEK.forEach(day => {
      intervalsInWeekDay.set(day.toUpperCase(), false);
    });
    const workingHoursInDay = 8;
    const workingDayDuration = workingHoursInDay * 60;
    const schedule = mapWorkingHoursToSchedule(workingHours, timezone);
    expect(schedule.intervals.length).toBe(DAYS_OF_WEEK.length);
    schedule.intervals.forEach((recurringInterval: RecurringInterval) => {
      expect(recurringInterval.interval.hourOfDay).toBe(9);
      expect(recurringInterval.interval.minuteOfHour).toBe(0);
      expect(recurringInterval.interval.duration).toBe(workingDayDuration);
      expect(
        intervalsInWeekDay.get(recurringInterval.interval.daysOfWeek),
      ).toBe(false);
      intervalsInWeekDay.set(recurringInterval.interval.daysOfWeek, true);
    });
  });

  it('should calc leaping working hour', () => {
    const workingHours = createALeapWorkingHours();
    const leapHoursOfWorking = 4;
    const leapingWorkingDuration = leapHoursOfWorking * 60;

    const schedule = mapWorkingHoursToSchedule(workingHours, timezone);

    const interval = schedule.intervals[0].interval;
    expect(interval.hourOfDay).toBe(22);
    expect(interval.minuteOfHour).toBe(0);
    expect(interval.duration).toBe(leapingWorkingDuration);
  });

  it('should add more then one working Interval', () => {
    const workingHours = create2WorkingIntervals();
    const intervalsInWeekDay = new Map<string, number>();
    const twoWorkingIntervals = 2;
    DAYS_OF_WEEK.forEach(day => {
      intervalsInWeekDay.set(day.toUpperCase(), twoWorkingIntervals);
    });

    const schedule = mapWorkingHoursToSchedule(workingHours, timezone);
    schedule.intervals.forEach((recurringInterval: RecurringInterval) => {
      intervalsInWeekDay.set(
        recurringInterval.interval.daysOfWeek,
        intervalsInWeekDay.get(recurringInterval.interval.daysOfWeek) - 1,
      );
    });
    expectToHaveSeenTwoIntervalsAWeekDay(intervalsInWeekDay);
  });

  function twenty4GHoursWork() {
    return { startTime: '10:00:00.000', endTime: '10:00:00.000' };
  }

  it('should convert 24 hours duration', () => {
    const twenty4HoursInMinites = 24 * 60;
    const workingHours: any = {};
    DAYS_OF_WEEK.forEach(day => {
      workingHours[day] = [twenty4GHoursWork()];
    });
    const schedule = mapWorkingHoursToSchedule(workingHours, timezone);
    schedule.intervals[0].interval.duration = twenty4HoursInMinites;
  });

  function expectToHaveSeenTwoIntervalsAWeekDay(
    intervalsInWeekDay: Map<string, number>,
  ) {
    DAYS_OF_WEEK.forEach(day => {
      expect(intervalsInWeekDay.get(day.toUpperCase())).toBe(0);
    });
  }
});
