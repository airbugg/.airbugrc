import { mapScheduleToWorkingHours } from './schedule-to-working-hours-mapper';
import {
  Day,
  Interval,
  RecurringInterval,
} from '@wix/ambassador-resources-server/rpc';
import { WorkingHoursDto } from '../../../dto/working-hours.dto';
import { aNineToFiveInterval } from '../../../../test/builders/rpc-custom/schedule-builder';
import {
  aLinkedSchedule,
  anAvailability,
  aRecurringInterval,
} from '@wix/ambassador-resources-server/builders';
import {
  anInterval,
  aSchedule,
} from '@wix/ambassador-services-server/builders';

describe('scheduleToWorkingHours', () => {
  function buildASchedule(aRecurringIntervalArray: RecurringInterval[]) {
    return aSchedule()
      .withIntervals(aRecurringIntervalArray)
      .withAvailability(null)
      .build();
  }

  function buildARecurringInterval(intervals): RecurringInterval {
    return aRecurringInterval()
      .withInterval(intervals)
      .build();
  }

  function buildALinkedSchedule() {
    return aSchedule()
      .withAvailability(
        anAvailability()
          .withLinkedSchedules([aLinkedSchedule().build()])
          .build(),
      )
      .build();
  }

  function buildAnInterval(
    hour: number,
    minute: number,
    duration: number,
    dayOfWeek: string,
  ): Interval {
    return anInterval()
      .withHourOfDay(hour)
      .withMinuteOfHour(minute)
      .withDuration(duration)
      .withDaysOfWeek(dayOfWeek as Day)
      .build();
  }

  function buildWeirdWorkingDayAnInterval() {
    const startWorkingHour = 10;
    const startWorkingMinutes = 21;
    const nineHours = 9;
    const plusMinutes = 22;
    const ninePauseHourWorkingHour = nineHours * 60 + plusMinutes;
    return buildAnInterval(
      startWorkingHour,
      startWorkingMinutes,
      ninePauseHourWorkingHour,
      'SUN',
    );
  }

  it('should return empty working hours when no interval', () => {
    const schedule = buildASchedule([]);
    const aWorkingHours: WorkingHoursDto = mapScheduleToWorkingHours(schedule);
    expect(aWorkingHours.sun).toBe(null);
    expect(aWorkingHours.mon).toBe(null);
    expect(aWorkingHours.tue).toBe(null);
    expect(aWorkingHours.thu).toBe(null);
    expect(aWorkingHours.wed).toBe(null);
    expect(aWorkingHours.fri).toBe(null);
    expect(aWorkingHours.sat).toBe(null);
  });

  it('should have single working on sunday', () => {
    const aInterval = buildWeirdWorkingDayAnInterval();
    const aRecurringIntervalArray = [buildARecurringInterval(aInterval)];
    const schedule = buildASchedule(aRecurringIntervalArray);

    const aWorkingHours: WorkingHoursDto = mapScheduleToWorkingHours(schedule);

    const workInterval = aWorkingHours.sun[0];
    expect(aWorkingHours.sun.length).toBe(1);
    expect(workInterval.startTime).toBe('10:21:00.000');
    expect(workInterval.endTime).toBe('19:43:00.000');
  });

  it('should have more than one interval working on sunday', () => {
    const aInterval1 = aNineToFiveInterval('SUN');
    const aInterval2 = buildWeirdWorkingDayAnInterval();
    const aRecurringIntervalList = [
      buildARecurringInterval(aInterval1),
      buildARecurringInterval(aInterval2),
    ];
    const schedule = buildASchedule(aRecurringIntervalList);

    const aWorkingHours: WorkingHoursDto = mapScheduleToWorkingHours(schedule);

    const workInterval1 = aWorkingHours.sun[0];
    const workInterval2 = aWorkingHours.sun[1];
    expect(aWorkingHours.sun.length).toBe(2);
    expect(workInterval1.startTime).toBe('09:00:00.000');
    expect(workInterval1.endTime).toBe('17:00:00.000');

    expect(workInterval2.startTime).toBe('10:21:00.000');
    expect(workInterval2.endTime).toBe('19:43:00.000');
  });

  it('should return null using business workings hours', () => {
    const schedule = buildALinkedSchedule();
    expect(mapScheduleToWorkingHours(schedule)).toBe(null);
  });
});
