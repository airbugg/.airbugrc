export interface WorkingHoursDto {
  fri: null | { startTime; endTime }[];
  mon: null | { startTime; endTime }[];
  sat: null | { startTime; endTime }[];
  sun: null | { startTime; endTime }[];
  thu: null | { startTime; endTime }[];
  tue: null | { startTime; endTime }[];
  wed: null | { startTime; endTime }[];
}
