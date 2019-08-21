import {
  aLinkedSchedule,
  aRecurringInterval,
  aSchedule,
  IntervalDTOBuilder,
} from '@wix/ambassador-resources-server/builders';
import { Day, Interval } from '@wix/ambassador-resources-server/rpc';
import { Chance } from 'chance';
import { Schedule } from '@wix/ambassador-services-catalog-server/rpc';
import {
  anAvailability,
  anAvailabilityConstraints,
} from '@wix/ambassador-schedule-server/builders';
import { LinkedSchedule } from '@wix/ambassador-schedule-server/rpc';
import { DAYS_OF_WEEK } from '../../../src/adapters/mappers/working-hours/working-hours-to-schedule-mapper';
import { Transparency } from '@wix/ambassador-services-server/types';

const chance = new Chance();

export function aNineToFiveInterval(dayOfWeek: string) {
  const startWorkingHour = 9;
  const startWorkingMinutes = 0;
  const nineHourWorkingHour = 8 * 60;
  return buildAnInterval(
    startWorkingHour,
    startWorkingMinutes,
    nineHourWorkingHour,
    dayOfWeek,
  );
}

export function anOverNightInterval(dayOfWeek: string) {
  //23:30 - 8:30
  const startWorkingHour = 23;
  const startWorkingMinutes = 30;
  const hourWorkingHour = 9 * 60;
  return buildAnInterval(
    startWorkingHour,
    startWorkingMinutes,
    hourWorkingHour,
    dayOfWeek,
  );
}

export function aTwentyFourHoursDay(dayOfWeek: string) {
  const startWorkingHour = 6;
  const startWorkingMinutes = 0;
  const nineHourWorkingHour = 24 * 60;
  return buildAnInterval(
    startWorkingHour,
    startWorkingMinutes,
    nineHourWorkingHour,
    dayOfWeek,
  );
}

export function aSimpleSchedule(
  intervalsFactory: (() => Interval)[],
): Schedule {
  const recurringIntervals = intervalsFactory.map(factory => {
    return aRecurringInterval()
      .withInterval(factory())
      .build();
  });
  const schedule = aSchedule()
    .withIntervals(recurringIntervals)
    .withScheduleOwnerId(chance.guid())
    .withAvailability(
      anAvailability()
        .withStart(new Date().toISOString())
        .withConstraints(anAvailabilityConstraints().build())
        .withLinkedSchedules(null)
        .build(),
    )
    .withId(chance.guid())
    .build();
  return schedule;
}

function buildAnInterval(
  hour: number,
  minute: number,
  duration: number,
  dayOfWeek: string,
): Interval {
  return new IntervalDTOBuilder()
    .withHourOfDay(hour)
    .withMinuteOfHour(minute)
    .withDuration(duration)
    .withDaysOfWeek(dayOfWeek as Day)
    .build();
}

export function aNineToFive7DaysAWeekSchedule(): Schedule {
  const intervals = DAYS_OF_WEEK.map(day =>
    aNineToFiveInterval.bind(null, day),
  );
  return aSimpleSchedule(intervals);
}

export function aScheduleWithLinkSchedule(scheduleToLink: Schedule): Schedule {
  const linkedSchedule: LinkedSchedule = createLinkScheduleFromSchedule(
    scheduleToLink,
  );
  return aSchedule()
    .withId(chance.guid())
    .withAvailability(
      anAvailability()
        .withLinkedSchedules([linkedSchedule])
        .build(),
    )
    .build();
}

export function createLinkScheduleFromSchedule(
  scheduleToLink: Schedule,
): LinkedSchedule {
  return aLinkedSchedule()
    .withScheduleId(scheduleToLink.id)
    .withScheduleOwnerId(scheduleToLink.id)
    .withTransparency(Transparency.FREE)
    .build();
}
