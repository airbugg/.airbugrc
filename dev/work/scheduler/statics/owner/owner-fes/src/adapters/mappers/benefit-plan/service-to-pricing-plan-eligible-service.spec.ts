import { PricingPlanEligibleService } from '../../../dto/pricing-plans/pricing-plan.dto';
import { mapServiceToPricingPlanEligibleService } from './service-to-pricing-plan-eligible-service';
import { OfferedAsType } from '../../../dto/offerings/offering.dto';
import { Chance } from 'chance';
import { aServiceResponseWithPlan } from '../../../../test/builders/rpc-custom/service';

const chance = new Chance();
describe('mapServiceToPricingPlanEligibleService', () => {
  it('should map simple service', async () => {
    const service = aServiceResponseWithPlan().build();
    const eligibleService: PricingPlanEligibleService = mapServiceToPricingPlanEligibleService(
      service,
      service.pricingPlans[0].id,
    );
    expect(eligibleService.id).toBe(service.service.id);
    expect(eligibleService.title).toBe(service.service.info.name);
    expect(eligibleService.offeredAs).toEqual([
      OfferedAsType.PRICING_PLAN,
      OfferedAsType.ONE_TIME,
    ]);
    expect(eligibleService.isAttachedOnlyToCurrentPlan).toBe(true);
    expect(eligibleService.image.height).toBe(
      service.service.info.images[0].height,
    );
  });

  it('should put null when no image for service', async () => {
    const service = aServiceResponseWithPlan().build();
    delete service.service.info.images;
    const eligibleService: PricingPlanEligibleService = mapServiceToPricingPlanEligibleService(
      service,
      service.pricingPlans[0].id,
    );
    expect(eligibleService.image).toBe(null);
  });
});
