import { Schedule } from '@wix/ambassador-resources-server/rpc';
import { mapScheduleListToSimpleIntervalMap } from './schedule-to-simple-interval';
import * as moment from 'moment';
import { Resource } from '@wix/ambassador-services-catalog-server/rpc';

export class SimpleInterval {
  public schedulerOwnerId: string;
  public start: moment.Moment;
  public end: moment.Moment;

  public isLongerThen(duration) {
    return this.end.diff(this.start, 'minute') >= duration;
  }

  public isLongerThen24Hours(): boolean {
    const duration = 24 * 60;
    return this.isLongerThen(duration);
  }
  public isIntersect(interval: SimpleInterval): boolean {
    return this.start.diff(interval.end, 'm') < 1;
  }
}

export function scheduleToWhoWorkings(
  schedules: Schedule[],
  businessSchedule: Schedule,
  serviceDuration,
  resources: Resource[],
): any {
  /*
   simpleInterval{schedulerOwnerId, start:{day, hour, minutes}, end:{day, hour, minutes}}
   1. create Simplified interval list map()<schedulerOwnerId,simpleInterval[]>
   2. sort by start hour
   3. merge interval of same staff
  */
  let intervalsMap: Map<string, SimpleInterval[]>;
  let changePoints: moment.Moment[];
  intervalsMap = mapScheduleListToSimpleIntervalMap(
    schedules,
    businessSchedule,
  );
  intervalsMap = mergeOverLappingIntervalsByOwnerId(intervalsMap);
  intervalsMap = filterNonUsableIntervals(intervalsMap, serviceDuration);
  intervalsMap = splitOverNightIntervals(intervalsMap);

  changePoints = extractAllEdges(intervalsMap);
  changePoints = sortChangePoints(changePoints);

  const whoWorkingsMap: any = new Map();
  for (let i = 0; i < changePoints.length - 1; i++) {
    const startTime = changePoints[i];
    const endTime = changePoints[i + 1];
    const ids = getWHoWorksBetween(intervalsMap, startTime);
    if (ids.length > 0) {
      addARow(whoWorkingsMap, startTime, endTime, ids);
    }
  }
  const whoWorkingsArray: any[] = Array.from(whoWorkingsMap.values());
  return enrichStaffAvailability(whoWorkingsArray, resources);
}

function enrichStaffAvailability(
  whoWorkingsArray: any[],
  resources: Resource[],
) {
  whoWorkingsArray.forEach(day => {
    if (day.workingHours) {
      day.workingHours.forEach(interval => {
        if (interval.staff) {
          interval.staff = interval.staff.map(id => {
            const staffMember = resources.find(res => res.id === id);
            return {
              id,
              fullName: staffMember.name,
            };
          });
        }
      });
    }
  });
  return whoWorkingsArray;
}

function sortSimpleIntervalByStart(intervals: SimpleInterval[]) {
  intervals.sort((intervalA, intervalB) => {
    if (intervalA.start === intervalB.start) {
      return intervalA.end.unix() - intervalB.end.unix();
    }
    return intervalA.start.unix() - intervalB.start.unix();
  });
  return intervals;
}

function mergeOverLappingIntervals(intervals: SimpleInterval[]): any {
  intervals = sortSimpleIntervalByStart(intervals);
  const mergeIntervals: SimpleInterval[] = [];
  let currentInterval = intervals[0];
  for (let i = 1; i < intervals.length; i++) {
    if (intervals[i].isIntersect(currentInterval)) {
      if (currentInterval.end.diff(intervals[i].end, 'm') < 1) {
        currentInterval.end = intervals[i].end;
      }
    } else {
      mergeIntervals.push(currentInterval);
      currentInterval = intervals[i];
    }
  }
  mergeIntervals.push(currentInterval);
  return mergeIntervals;
}

function mergeOverLappingIntervalsByOwnerId(
  intervalsMap,
): Map<string, SimpleInterval[]> {
  intervalsMap.forEach((intervals, key) => {
    intervalsMap.set(key, mergeOverLappingIntervals(intervals));
  });
  return intervalsMap;
}

function filterNonUsableIntervals(intervalsMap, serviceDuration) {
  intervalsMap.forEach((intervals, key, map) => {
    intervals = intervals.filter(simpleInterval =>
      simpleInterval.isLongerThen(serviceDuration),
    );
    if (intervals.length === 0) {
      map.delete(key);
    } else {
      map.set(key, intervals);
    }
  });
  return intervalsMap;
}

function extractAllEdges(
  intervalsMap: Map<string, SimpleInterval[]>,
): moment.Moment[] {
  //const timePoints: moment.Moment[] = [];
  const timePoints: Map<number, moment.Moment> = new Map<
    number,
    moment.Moment
  >();
  intervalsMap.forEach(intervals => {
    intervals.forEach(interval => {
      if (!timePoints.has(interval.start.unix())) {
        timePoints.set(interval.start.unix(), interval.start);
      }
      if (!timePoints.has(interval.end.unix())) {
        timePoints.set(interval.end.unix(), interval.end);
      }
    });
  });
  return Array.from(timePoints.values());
}

function sortChangePoints(timePoints: moment.Moment[]) {
  return timePoints.sort((a, b) => {
    return a.unix() - b.unix();
  });
}

function splitOverNightIntervals(intervalsMap) {
  intervalsMap.forEach((intervals, key, map) => {
    const spitedList = splitOverNight(intervals, []);
    intervalsMap.set(key, spitedList);
  });
  return intervalsMap;
}

function splitOverNight(
  intervals: SimpleInterval[],
  spitedList: SimpleInterval[],
) {
  const currentInterval = intervals.pop();
  if (currentInterval.isLongerThen24Hours()) {
    const newInterval = new SimpleInterval();
    newInterval.schedulerOwnerId = currentInterval.schedulerOwnerId;
    newInterval.end = currentInterval.end.clone();
    currentInterval.end = currentInterval.start.clone().add(24, 'hour');
    newInterval.start = currentInterval.end.clone();
    intervals.push(newInterval);
  }
  spitedList.push(currentInterval);
  if (intervals.length === 0) {
    return spitedList;
  }
  return splitOverNight(intervals, spitedList);
}

function getWHoWorksBetween(
  intervalsMap: Map<string, SimpleInterval[]>,
  startTime: moment.Moment,
): string[] {
  const staffIds = new Set<string>();
  intervalsMap.forEach((value: SimpleInterval[]) => {
    value.forEach((interval: SimpleInterval) => {
      if (startTime.isBetween(interval.start, interval.end, 'minute', '[)')) {
        staffIds.add(interval.schedulerOwnerId);
      }
    });
  });
  return Array.from(staffIds.values());
}
function addARow(whoWorkingsMap, startTime, endTime, ids) {
  let workingHours;
  const day = formatDay(startTime);
  if (whoWorkingsMap.has(day)) {
    workingHours = whoWorkingsMap.get(day).workingHours;
  } else {
    workingHours = [];
    whoWorkingsMap.set(day, { day, workingHours });
  }
  workingHours.push({
    interval: {
      startTime: formatHour(startTime),
      endTime: formatHour(endTime),
    },
    staff: ids,
  });
}
/*
|----|
  |-|
*/
function formatHour(time: moment.Moment): string {
  return time.format('HH:mm:00.000');
}

function formatDay(time: moment.Moment): string {
  return time.format('ddd').toLowerCase();
}
