export enum OfferingTypes {
  GROUP = 'GROUP',
  INDIVIDUAL = 'INDIVIDUAL',
  COURSE = 'COURSE',
}
export const LABELED_PRICE: string = 'general';
export type ActionStatusType = 'ADD_PREMIUM' | 'ADD' | 'EDIT_PREMIUM' | 'EDIT';

export class ActionStatusTypes {
  static ADD_PREMIUM: ActionStatusType = 'ADD_PREMIUM';
  static ADD: ActionStatusType = 'ADD';
  static EDIT_PREMIUM: ActionStatusType = 'EDIT_PREMIUM';
  static EDIT: ActionStatusType = 'EDIT';
}

export type LocationType = 'OTHER' | 'BUSINESS' | 'CUSTOMER';

export class LocationTypes {
  static OTHER: LocationType = 'OTHER';
  static BUSINESS: LocationType = 'BUSINESS';
  static CUSTOMER: LocationType = 'CUSTOMER';
}

export type CourseState = 'FUTURE' | 'ONGOING' | 'PAST';

export class CourseStates {
  static FUTURE: CourseState = 'FUTURE';
  static ONGOING: CourseState = 'ONGOING';
  static PAST: CourseState = 'PAST';
}

export class OfferingsConst {
  static OFFERING_DELETED_EVENT = 'OfferingsConst.offering-deleted';
  static DATE_FORMAT = 'YYYY-MM-DD';
}
