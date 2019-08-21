import {
  Day,
  Interval,
  RecurringInterval,
  Schedule,
} from '@wix/ambassador-resources-server/rpc';
import * as moment from 'moment-timezone/builds/moment-timezone-with-data-2012-2022';
import { WorkingHoursDto } from '../../../dto/working-hours.dto';

export interface TimeOfDay {
  hours: number;
  minutes: number;
}

export const DAYS_OF_WEEK: string[] = [
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
  'sun',
];

export function mapWorkingHoursToSchedule(
  workingHours: WorkingHoursDto,
  timezone: string,
): Schedule {
  return {
    intervals: addRecurringInterval(workingHours, timezone),
    totalNumberOfParticipants: null,
    tags: [],
    participants: [],
    availability: {
      start: startOfDayISOString(timezone),
      linkedSchedules: [],
    },
    id: null,
    status: null,
    version: null,
  };
}

function extractTime(stringTime: string): TimeOfDay {
  const timeParts = stringTime.split(':');
  return {
    hours: parseInt(timeParts[0], 10),
    minutes: parseInt(timeParts[1], 10),
  };
}

export function calcIntervalDuration(
  startTime: TimeOfDay,
  endTime: TimeOfDay,
): number {
  const aStartTime = moment()
    .hour(startTime.hours)
    .minute(startTime.minutes)
    .utc();
  const aEndTime = moment()
    .hour(endTime.hours)
    .minute(endTime.minutes)
    .utc();
  let diff = aEndTime.diff(aStartTime, 'minutes', false);
  if (diff <= 0) {
    aEndTime.add(1, 'day');
    diff = aEndTime.diff(aStartTime, 'minutes', false);
  }
  return diff;
}
export function startOfDayISOString(timezone: string) {
  return moment()
    .tz(timezone)
    .startOf('day')
    .toISOString();
}
function createRecurringInterval(
  day: string,
  interval: any,
  timezone: string,
): RecurringInterval {
  const statTime: TimeOfDay = extractTime(interval.startTime);
  const endTime: TimeOfDay = extractTime(interval.endTime);
  const duration = calcIntervalDuration(statTime, endTime);
  const anInterval: Interval = {
    daysOfWeek: day.toUpperCase() as Day,
    hourOfDay: statTime.hours,
    minuteOfHour: statTime.minutes,
    duration,
  };
  const aRecurringInterval: RecurringInterval = {
    affectedSchedules: null,
    start: startOfDayISOString(timezone),
    frequency: { repetition: 1 },
    interval: anInterval,
    id: null,
  };
  return aRecurringInterval;
}

function addRecurringInterval(
  workingHours: WorkingHoursDto,
  timezone: string,
): RecurringInterval[] {
  const recurringInterval: RecurringInterval[] = [];
  DAYS_OF_WEEK.forEach(day => {
    if (workingHours[day]) {
      workingHours[day].forEach(interval => {
        recurringInterval.push(
          createRecurringInterval(day, interval, timezone),
        );
      });
    }
  });
  return recurringInterval;
}
