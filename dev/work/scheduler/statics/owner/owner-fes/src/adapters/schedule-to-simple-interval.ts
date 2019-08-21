import {
  RecurringInterval,
  Schedule,
} from '@wix/ambassador-resources-server/rpc';
import { SimpleInterval } from './scheduler-to-whos-working';
import { Interval } from '@wix/ambassador-services-server';
import * as moment from 'moment';

function isLinkedSchedule(staffSchedule: Schedule) {
  return (
    staffSchedule.availability &&
    staffSchedule.availability.linkedSchedules &&
    staffSchedule.availability.linkedSchedules.length > 0
  );
}

function simplifiedSchedule(
  staffSchedule: Schedule,
  businessSchedule: Schedule,
): SimpleInterval[] {
  const simpleIntervalsList = [];
  let scheduleToUse = staffSchedule;
  if (isLinkedSchedule(staffSchedule)) {
    scheduleToUse = businessSchedule;
  }
  if (scheduleToUse.intervals && scheduleToUse.intervals.length) {
    scheduleToUse.intervals.forEach((recurringInterval: RecurringInterval) => {
      const simpleInterval = new SimpleInterval();
      simpleInterval.schedulerOwnerId = staffSchedule.scheduleOwnerId;
      simpleInterval.start = intervalToStartTimeOfWeek(
        recurringInterval.interval,
      );
      simpleInterval.end = intervalToEndTimeOfWeek(recurringInterval.interval);
      simpleIntervalsList.push(simpleInterval);
    });
  }
  return simpleIntervalsList;
}

function intervalToEndTimeOfWeek(interval: Interval): moment.Moment {
  return toTimeInAWeek(
    interval.daysOfWeek.toLowerCase(),
    interval.hourOfDay,
    interval.minuteOfHour,
    interval.duration,
  );
}

function intervalToStartTimeOfWeek(interval: Interval): moment.Moment {
  return toTimeInAWeek(
    interval.daysOfWeek.toLowerCase(),
    interval.hourOfDay,
    interval.minuteOfHour,
  );
}

function toTimeInAWeek(
  dayOfWeek,
  hour: number,
  minute: number,
  offset: number = 0,
) {
  const time = moment()
    .utc()
    .day(dayOfWeek)
    .hour(hour)
    .minute(minute)
    .add(offset, 'minute');
  time.second(0).millisecond(0);
  return time;
}

export function mapScheduleListToSimpleIntervalMap(
  schedules: Schedule[],
  businessSchedule: Schedule,
): Map<string, SimpleInterval[]> {
  const simplifyScheduleMap: Map<string, SimpleInterval[]> = new Map();
  schedules.forEach((schedule: Schedule) => {
    const list: SimpleInterval[] = simplifiedSchedule(
      schedule,
      businessSchedule,
    );
    if (list.length > 0) {
      simplifyScheduleMap.set(schedule.scheduleOwnerId, list);
    }
  });
  return simplifyScheduleMap;
}
