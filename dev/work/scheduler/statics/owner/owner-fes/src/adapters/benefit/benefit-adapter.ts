import {
  GetServiceResponse,
  ListServicesResponse,
  Query,
} from '@wix/ambassador-services-catalog-server/rpc';
import {
  PricingPlanEligibleService,
  UpdateBenefitsDTO,
} from '../../dto/pricing-plans/pricing-plan.dto';
import { mapServiceToPricingPlanEligibleService } from '../mappers/benefit-plan/service-to-pricing-plan-eligible-service';
import { buildQueryForOfferingByType } from '../offerings/services-catalog-rpc';
import {
  Benefit,
  ListResponse,
} from '@wix/ambassador-pricing-plan-benefits-server';

import {
  BookingBenefitResponse,
  mapBenefitsWithPlanInfoToBookingBenefit,
  mapUpdateBenefitsDTOToBenefit,
} from '../mappers/benefit-plan/benefits-with-planInfo-to-booking-benefit';
import { benefitWithPlanInfoToPlan } from '../mappers/benefit-plan/benefit-with-plan-info-to-plan';
import { PaymentSelection, Session } from '@wix/ambassador-bookings-server';
import { CheckoutOptionsResponse, Plan } from '@wix/ambassador-checkout-server';
import { extractSessionInfo } from '../mappers/appointment-to-bookings';
import { mapPaidPlanToBenefitOrderId } from '../mappers/benefit-plan/paid-plan-to-plan-order-id';
import { getPaymentSelectionBySchedules } from '../payment-selection';

export async function getEligibleServicesForPlan(
  getterOfServiceList: (query: Query) => Promise<ListServicesResponse>,
  forPlan: string = null,
): Promise<PricingPlanEligibleService[]> {
  let eligibleServices = [];
  const getServiceResponse = await getterOfServiceList(
    buildQueryForOfferingByType(`"INDIVIDUAL","GROUP"`),
  );
  if (getServiceResponse && getServiceResponse.services) {
    eligibleServices = getServiceResponse.services.map(
      (service: GetServiceResponse) => {
        return mapServiceToPricingPlanEligibleService(service, forPlan);
      },
    );
  }
  return eligibleServices;
}

export async function getBenefit(
  planId: string,
  getterOfBookingBenefit: (planIds: string[]) => Promise<ListResponse>,
) {
  const listResponse = await getterOfBookingBenefit([planId]);
  const benefitResponse: BookingBenefitResponse = {
    benefits: [],
    planId,
    purchased: false,
  };
  if (listResponse.benefitsWithPlanInfo) {
    benefitResponse.benefits = mapBenefitsWithPlanInfoToBookingBenefit(
      listResponse.benefitsWithPlanInfo[0],
    );
    const benefitWithPlanInfo = listResponse.benefitsWithPlanInfo[0];
    benefitResponse.purchased = benefitWithPlanInfo.planInfo.hasOrders;
  }
  return benefitResponse;
}

export async function updateBenefit(
  updateBenefitsDTO: UpdateBenefitsDTO,
  updaterOfBenefit: (planId: string, benefit: Benefit) => Promise<any>,
  creatorOfBenefit: (planId: string, benefit: Benefit) => Promise<any>,
) {
  const benefit: Benefit = mapUpdateBenefitsDTOToBenefit(updateBenefitsDTO);
  let res;
  if (benefit.id) {
    res = await updaterOfBenefit(updateBenefitsDTO.planId, benefit);
  } else {
    res = await creatorOfBenefit(updateBenefitsDTO.planId, benefit);
  }
  return res;
}

export async function getPlansList(
  getterOfAllPlan: () => Promise<ListResponse>,
) {
  let plans = [];
  const allPlans = await getterOfAllPlan();
  if (allPlans.benefitsWithPlanInfo) {
    plans = allPlans.benefitsWithPlanInfo.map(benefitWithPlanInfoToPlan);
  }
  return plans;
}

export async function getPlanForSlot(
  offeringId: string,
  contactId: string,
  slotStartTime: number,
  resolveOfferingById: (string) => Promise<GetServiceResponse>,
  resolvePlanBenefit: (request: any) => Promise<CheckoutOptionsResponse>,
) {
  const offering = await resolveOfferingById(offeringId);
  const session: Session = extractSessionInfo(
    { from: slotStartTime, id: offeringId, to: slotStartTime + 1 },
    offering,
    {},
  );

  const paymentSelection: PaymentSelection = getPaymentSelectionBySchedules(
    offering.schedules,
  );

  // const req: CheckoutOptionsRequest = {
  const req = {
    createSession: session,
    contactId,
    paymentSelection,
  };
  const res = await resolvePlanBenefit(req);
  const relevantPlanBenefits = res.checkoutOptions.paidPlans;

  if (relevantPlanBenefits) {
    return mapPaidPlanToOwnerPlan(relevantPlanBenefits.defaultPlan);
  }

  return {};
}

const mapPaidPlanToOwnerPlan = (plan: Plan) => {
  if (!plan) {
    return {};
  }

  return {
    plan: {
      id: mapPaidPlanToBenefitOrderId(plan.paidPlan),
      name: plan.planName,
      type: plan.creditOriginal ? 'LIMITED' : 'UNLIMITED',
      totalSessions: plan.creditOriginal,
      remainingSessions: plan.creditRemain,
      validUntil: new Date(plan.validUntil).toISOString(),
    },
  };
};
