import { LocationType } from '../offerings/offerings.consts';

export enum CalendarItemType {
  Individual = 'Individual',
  Group = 'Group',
  Course = 'Course',
  Google = 'Google',
  Blocked = 'Blocked',
}

export enum LocationTypes {
  OTHER = 'OTHER',
  BUSINESS = 'BUSINESS',
  CUSTOMER = 'CUSTOMER',
}

export interface SessionDto extends CalendarItemDto {
  id: string;
  offeringId: string;
  offeringName: string;
  participantsCapacity: number;
  registeredParticipants: number;
  formattedLocation: string;
  locationType: LocationTypes;
  note: string;
  uouHidden: boolean;
}

export interface CalendarItemDto {
  offeringId?: string;
  type: CalendarItemType;
  staffId: string;
  startTime: number;
  endTime: number;
  origin: any;
}
export interface ClassSession {
  id?: string;
  serviceId?: string;
  location: LocationType;
  name: string;
  locationText: string;
  isFree: boolean;
  currency: string;
  capacity: number;
  classProtoId: string;
  staffMemberId: string;
  notes: string;
  classDate: string;
  classTime: string;
  start: number;
  end: number;
}

export interface CourseSession {
  id: string;
  note: string;
  staffMemberId: string;
  startTime: number;
  endTime: number;
}

export interface IndividualSession {
  from: number;
  id: string;
  notes: string;
  sendEmail: boolean;
  serviceId: string;
  staffMemberId: string;
  to: number;
  type: string;
}

export interface BlockedSession {
  from: number;
  id: string;
  notes: string;
  sendEmail: boolean;
  staffMemberId: string;
  to: number;
  type: string;
}
