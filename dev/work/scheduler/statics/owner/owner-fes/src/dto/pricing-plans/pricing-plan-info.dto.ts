import { PricingPlanDto } from './pricing-plan.dto';

export interface PricingPlanInfoDto {
  displayText: string;
  pricingPlans: PricingPlanDto[];
}
