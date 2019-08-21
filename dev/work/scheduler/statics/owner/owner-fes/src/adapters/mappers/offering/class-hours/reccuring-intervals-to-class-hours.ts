import {
  Interval,
  LinkedSchedule,
  RecurringInterval,
} from '@wix/ambassador-services-server/rpc';
import { Day, Days } from '../../../../dto/offerings/working-days.dto';
import { DAYS_OF_WEEK } from '../../working-hours/working-hours-to-schedule-mapper';
import * as moment from 'moment';

export function getZeroPaddedTime(time: number) {
  return `0${time}`.slice(-2);
}

export function convertRecurringIntervalsToClassHours(
  intervals: RecurringInterval[],
): Days {
  const classHours = initClasshours();

  for (const recurringInterval of intervals) {
    const dayOfWeek = recurringInterval.interval.daysOfWeek.toLowerCase();
    if (!classHours[dayOfWeek]) {
      classHours[dayOfWeek] = getWorkingHours(recurringInterval);
    } else {
      classHours[dayOfWeek].workingHours.push(
        getAWorkingHour(recurringInterval),
      );
    }
  }

  return classHours;
}

function initClasshours() {
  const classHours = {};
  for (const day of DAYS_OF_WEEK) {
    classHours[day] = null;
  }

  return classHours;
}

function getHourTime(interval: Interval) {
  const endTime = moment(`1970-01-01T00:00:00.000Z`)
    .add(interval.hourOfDay, 'hours')
    .add(interval.minuteOfHour, 'minutes')
    .add(interval.duration, 'minutes')
    .toISOString()
    .slice(11, 16);

  return {
    startTime: `${getZeroPaddedTime(interval.hourOfDay)}:${getZeroPaddedTime(
      interval.minuteOfHour,
    )}`,
    endTime,
  };
}

function getAWorkingHour(recurringInterval: RecurringInterval) {
  return {
    id: recurringInterval.id,
    workingHour: getHourTime(recurringInterval.interval),
    staffId: getStaffIdfromLinkedSchedules(recurringInterval.affectedSchedules),
  };
}

function getWorkingHours(reccuringInterval: RecurringInterval): Day {
  return {
    workingHours: [getAWorkingHour(reccuringInterval)],
  };
}

function getStaffIdfromLinkedSchedules(schedules: LinkedSchedule[]): string {
  return schedules && schedules[0] ? schedules[0].scheduleOwnerId : '';
}
