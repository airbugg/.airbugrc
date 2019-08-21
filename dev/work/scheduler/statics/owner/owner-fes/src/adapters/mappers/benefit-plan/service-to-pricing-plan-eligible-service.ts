import { PricingPlanEligibleService } from '../../../dto/pricing-plans/pricing-plan.dto';
import {
  GetServiceResponse,
  PricingPlan,
} from '@wix/ambassador-services-catalog-server/rpc';
import { getOfferedAs } from '../offering/service-to-offering';
import { mapImagesList } from '../image/platfrom-image-to-web-image-mapper';

export function mapServiceToPricingPlanEligibleService(
  service: GetServiceResponse,
  forPlanId: string,
): PricingPlanEligibleService {
  const eligibleService: PricingPlanEligibleService = {
    id: service.service.id,
    offeredAs: getOfferedAs(
      service.pricingPlans,
      service.schedules[0].rate,
      service.service.customProperties,
    ),
    title: service.service.info.name,
    isAttachedOnlyToCurrentPlan: isAttachOnlyForThisPlan(
      service.pricingPlans,
      forPlanId,
    ),
    image: mapImagesList(service.service.info.images),
  };
  return eligibleService;
}
function isAttachOnlyForThisPlan(
  plans: PricingPlan[],
  forPlanId: string,
): boolean {
  if (plans) {
    return plans.length === 1 && plans[0].id === forPlanId;
  }
  return false;
}
