export interface Days {
  mon?: Day;
  tue?: Day;
  wed?: Day;
  thu?: Day;
  fri?: Day;
  sat?: Day;
  sun?: Day;
}

export interface WorkingHour {
  startTime: string;
  endTime?: string;
}

export interface Day {
  workingHours?: {
    id?: string;
    teacher?: string;
    staffId?: string;
    workingHour?: WorkingHour;
  }[];
  enabled?: boolean;
}
