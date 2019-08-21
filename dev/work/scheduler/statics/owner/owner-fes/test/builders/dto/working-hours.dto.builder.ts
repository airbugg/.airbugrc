import { WorkingHoursDto } from '../../../src/dto/working-hours.dto';

export function buildAWorkingHours(): WorkingHoursDto {
  return {
    fri: null,
    mon: [{ startTime: '10:00:00.000', endTime: '18:00:00.000' }],
    thu: null,
    wed: null,
    tue: [{ startTime: '10:00:00.000', endTime: '18:00:00.000' }],
    sat: null,
    sun: null,
  };
}
