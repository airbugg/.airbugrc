import { mapBenefitsWithPlanInfoToBookingBenefit } from './benefits-with-planInfo-to-booking-benefit';
import {
  anyPlanInfo,
  limitedBenefit,
  limitedBenefitWithoutServices,
} from '../../../../test/builders/rpc-custom/benefit-with-plan';
import { aBenefitWithPlanInfo } from '@wix/ambassador-pricing-plan-benefits-server/builders';

describe('map platform benefit to bookings benefit', () => {
  it('map existing platform benefit to platform', () => {
    const benefit = limitedBenefit();
    const plan = anyPlanInfo();
    const benefitWithPlanInfo = aBenefitWithPlanInfo()
      .withPlanInfo(plan)
      .withBenefit(benefit)
      .build();
    const benefits = mapBenefitsWithPlanInfoToBookingBenefit(
      benefitWithPlanInfo,
    );
    benefit.resourceIds.forEach((resourceId: string) => {
      expect(benefits[0].includedServices).toContain(resourceId);
    });
    expect(benefits[0].numOfSessions).toBe(benefit.creditAmount);
    expect(benefits[0].type).toContain(benefit.benefitType);
    expect(benefits[0].id).toContain(benefit.id);
  });

  it('map existing platform benefit without services to platform', () => {
    const benefit = limitedBenefitWithoutServices();
    const plan = anyPlanInfo();
    const benefitWithPlanInfo = aBenefitWithPlanInfo()
      .withPlanInfo(plan)
      .withBenefit(benefit)
      .build();
    const benefits = mapBenefitsWithPlanInfoToBookingBenefit(
      benefitWithPlanInfo,
    );
    expect(benefits[0].includedServices).toEqual([]);
    expect(benefits[0].numOfSessions).toBe(benefit.creditAmount);
    expect(benefits[0].type).toContain(benefit.benefitType);
    expect(benefits[0].id).toContain(benefit.id);
  });
});
