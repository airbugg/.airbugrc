import { OfferingDto } from './offering.dto';
import { Days } from './working-days.dto';

export interface GroupSchedule {
  startDate: string;
  endDate: string;
  noEndDate: boolean;
  durationInMinutes: number;
  repeatEveryXWeeks: number;
  classHours: Days;
}

export interface GroupOfferingDto extends OfferingDto {
  schedule: GroupSchedule;
}
