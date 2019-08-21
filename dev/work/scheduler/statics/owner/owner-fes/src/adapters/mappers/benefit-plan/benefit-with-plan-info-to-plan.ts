import { BenefitWithPlanInfo } from '@wix/ambassador-pricing-plan-benefits-server';
import { PricingPlanData } from '../../../dto/pricing-plans/pricing-plan.dto';

export function benefitWithPlanInfoToPlan(
  benefitWitInfo: BenefitWithPlanInfo,
): PricingPlanData {
  return {
    id: benefitWitInfo.planInfo.id,
    name: benefitWitInfo.planInfo.name,
    status: benefitWitInfo.planInfo.status,
  };
}
