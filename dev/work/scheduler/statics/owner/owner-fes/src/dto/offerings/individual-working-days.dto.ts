export interface WorkingDay {
  day: WorkingDayName;
  workingHours?: {
    staff: {
      id: string;
      fullName: string;
    }[];
    interval: {
      startTime: string;
      endTime?: string;
    };
  }[];
}

export enum WorkingDayName {
  MONDAY = 'mon',
  TUESDAY = 'tue',
  WEDNESDAY = 'wed',
  THURSDAY = 'thu',
  FRIDAY = 'fri',
  SATURDAY = 'sat',
  SUNDAY = 'sun',
}
