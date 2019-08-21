import { Chance } from 'chance';
import { mapBenefitOrderIdToPaidPlan } from './benefit-order-Id-to-pricing-plan';
import { mapPaidPlanToBenefitOrderId } from './paid-plan-to-plan-order-id';
import { aPaidPlan } from '@wix/ambassador-checkout-server/builders';

const chance = new Chance();
describe('should paidPlan to benefit order Id', () => {
  it('should decode and encode benefit', () => {
    const paidPlan = aPaidPlan()
      .withOrderId(chance.guid())
      .withBenefitId(chance.guid())
      .build();
    const benefitOderId = mapPaidPlanToBenefitOrderId(paidPlan);
    const expectedPaidPlan = mapBenefitOrderIdToPaidPlan(benefitOderId);

    expect(paidPlan.benefitId).toBe(expectedPaidPlan.benefitId);
    expect(paidPlan.orderId).toBe(expectedPaidPlan.orderId);
  });
});
