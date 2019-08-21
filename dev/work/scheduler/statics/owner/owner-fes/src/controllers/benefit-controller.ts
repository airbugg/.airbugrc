import {
  getterOfServiceByIdFactory,
  getterOfServiceListByQueryFactory,
} from '../adapters/offerings/services-catalog-rpc';
import {
  getBenefit,
  getEligibleServicesForPlan,
  getPlanForSlot,
  getPlansList,
  updateBenefit,
} from '../adapters/benefit/benefit-adapter';
import {
  creatorOfBookingBenefitFactory,
  getterOfAllPlansFactory,
  getterOfBookingBenefitIdsFactory,
  updaterOfBookingBenefitFactory,
} from '../adapters/benefit/benefit-adapter-rpc';
import { UpdateBenefitsDTO } from '../dto/pricing-plans/pricing-plan.dto';
import { GetServiceResponse } from '@wix/ambassador-services-catalog-server/rpc';
import { getPlanBenefitFactory } from '../adapters/checkout-rpc';

import {
  CheckoutOptionsRequest,
  CheckoutOptionsResponse,
} from '@wix/ambassador-checkout-server';

export async function getEligibleServices(req, res) {
  const planId = req.params.pricingPlanId;
  const getterOfferingsList = getterOfServiceListByQueryFactory(req.aspects);
  const servicesList = await getEligibleServicesForPlan(
    getterOfferingsList,
    planId,
  );
  res.send({ services: servicesList });
}

export async function getBookingsBenefit(req, res) {
  const pricingPlanId = req.params.pricingPlanId;
  const getterOfBookingBenefit = getterOfBookingBenefitIdsFactory(req.aspects);
  const benefitPlan = await getBenefit(pricingPlanId, getterOfBookingBenefit);
  res.send(benefitPlan);
}

export async function updateBookingsBenefit(req, res) {
  const updateBenefitsDTO: UpdateBenefitsDTO = req.body;
  const updaterOfBookingBenefit = updaterOfBookingBenefitFactory(req.aspects);
  const creatorOfBookingBenefit = creatorOfBookingBenefitFactory(req.aspects);
  const response = await updateBenefit(
    updateBenefitsDTO,
    updaterOfBookingBenefit,
    creatorOfBookingBenefit,
  );
  res.send(response);
}

export async function getAllPlans(req, res) {
  const getterOfAllPlans = getterOfAllPlansFactory(req.aspects);
  const plans = await getPlansList(getterOfAllPlans);
  res.send({ pricingPlans: plans });
}

export async function getPlansForSlot(req, res) {
  const { contactId, offeringId, slotStartTime } = req.params;
  const slotStartTimeStamp: number = parseInt(slotStartTime, 10);

  const resolveOfferingById: (string) => Promise<GetServiceResponse> = id =>
    getterOfServiceByIdFactory(req.aspects)(id);
  const resolvePlanBenefit: (
    request: CheckoutOptionsRequest,
  ) => Promise<CheckoutOptionsResponse> = getPlanBenefitFactory(req.aspects);

  res.send(
    await getPlanForSlot(
      offeringId,
      contactId,
      slotStartTimeStamp,
      resolveOfferingById,
      resolvePlanBenefit,
    ),
  );
}
