import { Day, Days } from '../../../../dto/offerings/working-days.dto';
import {
  Day as IntervalDay,
  RecurringInterval,
} from '@wix/ambassador-services-server';
import { DAYS_OF_WEEK } from '../../working-hours/working-hours-to-schedule-mapper';
import { Resource } from '@wix/ambassador-resources-server/rpc';
import * as moment from 'moment-timezone';

export function convertClassHoursToRecurringIntervals(
  classHours: Days,
  allStaffLinkedSchedules: Resource[],
  start,
  end,
  timezone: string,
  duration: number = null,
  repetition = 1,
): RecurringInterval[] {
  const recurringIntervals = [];

  for (const day of DAYS_OF_WEEK) {
    if (!classHours[day]) {
      continue;
    }

    const classDay: Day = classHours[day];
    for (const classInterval of classDay.workingHours) {
      const startTime = classInterval.workingHour.startTime;
      const endTime = classInterval.workingHour.endTime;

      const hourOfDay = getHourOfDay(startTime);
      const minuteOfHour = getMinutesOfHour(
        classInterval.workingHour.startTime,
      );

      const calculatedDuration = duration
        ? duration
        : calculateDuration(startTime, endTime);

      const recurringInterval: RecurringInterval = {
        interval: {
          daysOfWeek: day.toUpperCase() as IntervalDay,
          duration: calculatedDuration,
          hourOfDay,
          minuteOfHour,
        },
        affectedSchedules: getLinkedSchedules(
          classInterval.staffId,
          allStaffLinkedSchedules,
        ),
        id: classInterval.id,
        start: getStartTime(start, hourOfDay, minuteOfHour, timezone),
        end: getEndTime(end, hourOfDay, minuteOfHour, duration, timezone),
        frequency: { repetition }, //todo
      };

      recurringIntervals.push(recurringInterval);
    }
  }
  return recurringIntervals;
}

function getHourOfDay(time) {
  return +time.split(':')[0];
}

function getMinutesOfHour(time) {
  return +time.split(':')[1];
}

function getZeroPadded(time) {
  return `0${time}`.slice(-2);
}

function getTimeAsISO(time) {
  const hour = getHourOfDay(time);
  const minute = getMinutesOfHour(time);
  return `1970-01-01T${getZeroPadded(hour)}:${getZeroPadded(minute)}:00.000`;
}

function calculateDuration(startTime, endTime) {
  const start = moment(getTimeAsISO(startTime));
  const end = moment(getTimeAsISO(endTime));

  let duration: number = moment.duration(end.diff(start)).asMinutes();

  if (duration <= 0) {
    duration = 24 * 60 + duration;
  }

  return duration;
}

function getStartTime(start, hour, minute, timezone): string {
  // return moment(`${start}T00:00:00.000Z`)
  //   .add(hour, 'hours')
  //   .add(minute, 'minutes')
  //   .toISOString();
  return moment
    .tz(start, timezone)
    .startOf('day')
    .toISOString();
}

function getEndTime(end, hour, minute, duration, timezone): string {
  // return moment(`${end}T00:00:00.000Z`)
  //   .add(hour, 'hours')
  //   .add(minute, 'minutes')
  //   .add(duration, 'minutes')
  //   .toISOString();
  return moment
    .tz(end, timezone)
    .endOf('day')
    .toISOString();
}

function getLinkedSchedules(staffId, allStaffLinkedSchedules) {
  const staffLinkedSchedules = allStaffLinkedSchedules.filter(
    staff => staff.scheduleOwnerId === staffId,
  );
  return staffLinkedSchedules;
}
