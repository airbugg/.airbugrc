import { CalendarItemDto } from './session.dto';

export interface BlockingCalendarItemDto extends CalendarItemDto {
  id: string;
  note: string;
}
