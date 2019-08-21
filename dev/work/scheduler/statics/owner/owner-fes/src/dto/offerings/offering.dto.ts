import { LocationType, OfferingTypes } from './offerings.consts';
import { PricingPlanInfoDto } from '../pricing-plans/pricing-plan-info.dto';

export const DEFAULT_MAX_PARTICIPANTS_PER_ORDER = 1;

export enum OfferedAsType {
  ONE_TIME = 'ONE_TIME',
  PRICING_PLAN = 'PRICING_PLAN',
}
export enum PaymentType {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  ALL = 'ALL',
}

export interface OfferingCategory {
  id: string;
  name: string;
  order: number;
  type: string;
}

export interface OfferingImage {
  fileName: string;
  relativeUri: string;
  width: number;
  height: number;
}

export interface URLDto {
  path: string;
  base: string;
}

export interface Payment {
  currency: string;
  price: number;
  isFree: boolean;
  priceText: string;
  minCharge: number;
  paymentType?: PaymentType;
}

export interface OfferingDto {
  id: string;
  categoryId: string;
  order: number;
  type: OfferingTypes;
  duplicationOf?: string;
  schedulePolicy: {
    maxParticipantsPerOrder: number;
    displayOnlyNoBookFlow: boolean;
    isBookable: boolean;
    uouHidden: boolean;
    capacity: number;
  };
  info: {
    name: string;
    description: string;
    images: OfferingImage[];
    tagLine: string;
  };
  location: {
    type: LocationType;
    locationText: string;
  };
  payment: Payment;
  offeredAs: OfferedAsType[];
  pricingPlanInfo: PricingPlanInfoDto;
  urls: {
    bookingPageUrl?: URLDto;
    servicePageUrl?: URLDto;
  };
}
