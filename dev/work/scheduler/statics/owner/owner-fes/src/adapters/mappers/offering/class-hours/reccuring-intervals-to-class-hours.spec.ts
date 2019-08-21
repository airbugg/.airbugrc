import { Chance } from 'chance';
import { DAYS_OF_WEEK } from '../../working-hours/working-hours-to-schedule-mapper';
import { Day } from '@wix/ambassador-services-server';
import {
  convertRecurringIntervalsToClassHours,
  getZeroPaddedTime,
} from './reccuring-intervals-to-class-hours';
import { aRecurringInterval } from '@wix/ambassador-resources-server/builders';
import { anInterval } from '@wix/ambassador-services-server/builders';

const HOUR_IN_MINUTES = 60;
const DAY_IN_MINUTES = 24 * 60;

describe('recurring intervals to class hours', () => {
  const chance = new Chance();

  it('one interval', () => {
    const dayIndex = chance.integer({ min: 0, max: 6 });
    const dayOfWeek = DAYS_OF_WEEK[dayIndex];
    const hour: number = chance.integer({ min: 0, max: 22 });
    const oneHourLater: number = hour + 1;
    const minute = chance.integer({ min: 0, max: 59 });
    // const duration = chance.integer({ min: 0, max: 59 });
    const start = new Date().toISOString();
    const end = new Date().toISOString();
    const intervalId = chance.guid();

    const interval = aRecurringInterval()
      .withInterval(
        anInterval()
          .withDaysOfWeek(dayOfWeek.toUpperCase() as Day)
          .withDuration(HOUR_IN_MINUTES)
          .withHourOfDay(hour)
          .withMinuteOfHour(minute)
          .build(),
      )
      .withStart(start)
      .withEnd(end)
      .withId(intervalId)
      .build();

    const classHours = convertRecurringIntervalsToClassHours([interval]);

    expect(classHours[dayOfWeek]).toBeDefined();
    expect(classHours[dayOfWeek].workingHours.length).toBe(1);
    expect(classHours[dayOfWeek].workingHours[0].id).toBe(intervalId);
    expect(classHours[dayOfWeek].workingHours[0].workingHour.startTime).toBe(
      `${getZeroPaddedTime(hour)}:${getZeroPaddedTime(minute)}`,
    );

    expect(classHours[dayOfWeek].workingHours[0].workingHour.endTime).toBe(
      `${getZeroPaddedTime(oneHourLater)}:${getZeroPaddedTime(minute)}`,
    );
  });

  it('two intervals on the same day', () => {
    const dayIndex = chance.integer({ min: 0, max: 6 });
    const dayOfWeek = DAYS_OF_WEEK[dayIndex];
    const hour: number = chance.integer({ min: 0, max: 22 });
    const oneHourLater: number = hour + 1;
    const minute = chance.integer({ min: 0, max: 59 });
    // const duration = chance.integer({ min: 0, max: 59 });
    const start = new Date().toISOString();
    const end = new Date().toISOString();
    const intervalId = chance.guid();

    const interval = aRecurringInterval()
      .withInterval(
        anInterval()
          .withDaysOfWeek(dayOfWeek.toUpperCase() as Day)
          .withDuration(HOUR_IN_MINUTES)
          .withHourOfDay(hour)
          .withMinuteOfHour(minute)
          .build(),
      )
      .build();

    const classHours = convertRecurringIntervalsToClassHours([
      interval,
      interval,
    ]);

    expect(classHours[dayOfWeek]).toBeDefined();
    expect(classHours[dayOfWeek].workingHours.length).toBe(2);

    expect(classHours[dayOfWeek].workingHours[0].workingHour.endTime).toBe(
      `${getZeroPaddedTime(oneHourLater)}:${getZeroPaddedTime(minute)}`,
    );
  });

  it('interval of 24 hours', () => {
    const dayIndex = chance.integer({ min: 0, max: 6 });
    const dayOfWeek = DAYS_OF_WEEK[dayIndex];
    const hour: number = chance.integer({ min: 1, max: 23 });
    const minute = chance.integer({ min: 0, max: 59 });

    const interval = aRecurringInterval()
      .withInterval(
        anInterval()
          .withDaysOfWeek(dayOfWeek.toUpperCase() as Day)
          .withDuration(DAY_IN_MINUTES)
          .withHourOfDay(hour)
          .withMinuteOfHour(minute)
          .build(),
      )
      .build();

    const classHours = convertRecurringIntervalsToClassHours([interval]);

    expect(classHours[dayOfWeek].workingHours[0].workingHour.startTime).toBe(
      `${getZeroPaddedTime(hour)}:${getZeroPaddedTime(minute)}`,
    );

    expect(classHours[dayOfWeek].workingHours[0].workingHour.endTime).toBe(
      `${getZeroPaddedTime(hour)}:${getZeroPaddedTime(minute)}`,
    );
  });
});
