import {
  anyPlanInfo,
  combineBenefitWithPlanInfo,
  limitedBenefit,
} from '../../../../test/builders/rpc-custom/benefit-with-plan';
import { mapBenefitsWithPlanInfoToBookingBenefit } from './benefits-with-planInfo-to-booking-benefit';
import { benefitWithPlanInfoToPlan } from './benefit-with-plan-info-to-plan';
import { PricingPlanData } from '../../../dto/pricing-plans/pricing-plan.dto';

describe('benefit with info to plan', () => {
  it('map benefitWithInfo to plan', () => {
    const plan = anyPlanInfo();
    const benefit = limitedBenefit();
    const benefitWithPlanInfo = combineBenefitWithPlanInfo(benefit, plan);
    const pricingPlanData: PricingPlanData = benefitWithPlanInfoToPlan(
      benefitWithPlanInfo,
    );
    expect(pricingPlanData.name).toBe(plan.name);
    expect(pricingPlanData.status).toBe(plan.status);
    expect(pricingPlanData.id).toBe(plan.id);
  });
});
