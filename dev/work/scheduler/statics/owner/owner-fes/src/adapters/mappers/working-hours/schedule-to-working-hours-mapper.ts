import {
  Interval,
  RecurringInterval,
  Schedule,
} from '@wix/ambassador-resources-server/rpc';
import { WorkingHoursDto } from '../../../dto/working-hours.dto';
import * as moment from 'moment';

export function mapScheduleToWorkingHours(schedule: Schedule): WorkingHoursDto {
  if (schedule.availability && schedule.availability.linkedSchedules) {
    return null;
  }

  const workingHours = createNewWorkingHours();
  if (schedule.intervals) {
    schedule.intervals.forEach((recurringInterval: RecurringInterval) => {
      addInterval(workingHours, recurringInterval.interval);
    });
  }
  return workingHours;
}

function addInterval(workingHours: WorkingHoursDto, interval: Interval) {
  const day = interval.daysOfWeek.toLowerCase();
  if (workingHours[day] === null) {
    workingHours[day] = [];
  }
  workingHours[day].push(createInterval(interval));
}

function createInterval(interval: Interval) {
  const timeFormat: string = 'HH:mm:00.000';
  const startTime = moment()
    .hours(interval.hourOfDay)
    .minute(interval.minuteOfHour);
  const end = moment()
    .hours((interval.hourOfDay as number) + Math.floor(interval.duration / 60)) //
    .minute((interval.minuteOfHour as number) + (interval.duration % 60));
  const workingInterval = {
    startTime: startTime.format(timeFormat),
    endTime: end.format(timeFormat),
  };
  return workingInterval;
}

export function createNewWorkingHours(): WorkingHoursDto {
  return {
    fri: null,
    mon: null,
    sat: null,
    sun: null,
    thu: null,
    tue: null,
    wed: null,
  };
}
