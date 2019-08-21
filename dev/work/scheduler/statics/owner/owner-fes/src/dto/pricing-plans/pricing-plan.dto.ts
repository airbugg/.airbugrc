import { WebImage } from '../Image.dto';

export interface PricingPlanDto {
  id: string;
  name: string;
  status: string;
}

export interface PricingPlanEligibleService {
  id?: string | null;
  title?: string | null;
  image?: WebImage | null;
  isAttachedOnlyToCurrentPlan?: boolean | null;
  offeredAs?: string[] | null;
}

export interface BookingBenefit {
  id?: string | null;
  type?: string | null;
  includedServices: string[];
  numOfSessions?: number | null;
}

export enum BookingBenefitType {
  UNDEFINED = 0,
  LIMITED = 1,
  UNLIMITED = 2,
}

export interface PricingPlanData {
  id?: string | null;
  name?: string | null;
  status?: string | null;
}

export interface UpdateBenefitsDTO {
  planId: string;
  benefits: BookingBenefit[];
}
