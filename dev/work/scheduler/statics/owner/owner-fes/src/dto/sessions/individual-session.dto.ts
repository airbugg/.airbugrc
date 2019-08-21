import { LocationTypes, SessionDto } from './session.dto';

export interface IndividualSessionDto extends SessionDto {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  formattedLocation: string;
  locationType: LocationTypes;
}
