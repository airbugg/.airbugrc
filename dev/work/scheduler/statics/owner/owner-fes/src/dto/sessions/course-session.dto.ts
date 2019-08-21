import { SessionDto } from './session.dto';

export interface CourseSessionDto extends SessionDto {
  offeringStartTime: number;
  offeringEndTime: number;
  intervalId: string;
}
