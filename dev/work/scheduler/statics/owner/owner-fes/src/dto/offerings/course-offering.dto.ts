import { OfferingDto } from './offering.dto';
import { Days } from './working-days.dto';

export interface CourseSchedule {
  startDate: string;
  endDate: string;
  actualStartDate: string;
  actualEndDate: string;
  noEndDate: boolean;
  repeatEveryXWeeks: number;
  classHours: Days;
}

export interface CourseOfferingDto extends OfferingDto {
  schedule: CourseSchedule;
}
