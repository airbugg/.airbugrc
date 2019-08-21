import { WorkingHoursDto } from './working-hours.dto';
import { WebImage } from './Image.dto';
export interface StaffDto {
  id?: string;
  fullName: string;
  phone: string;
  email: string;
  image?: WebImage;
  connectedCalendars?: any;
  workingHours: WorkingHoursDto;
  pristineOwner?: boolean;
}
