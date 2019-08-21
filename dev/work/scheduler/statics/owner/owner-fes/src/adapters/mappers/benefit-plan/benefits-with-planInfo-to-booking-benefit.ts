import {
  BookingBenefit,
  BookingBenefitType,
  UpdateBenefitsDTO,
} from '../../../dto/pricing-plans/pricing-plan.dto';
import {
  Benefit,
  BenefitType,
  BenefitWithPlanInfo,
} from '@wix/ambassador-pricing-plan-benefits-server';
import { Chance } from 'chance';

export interface BookingBenefitResponse {
  planId: String;
  purchased: any;
  benefits: BookingBenefit[];
}

export function mapBenefitsWithPlanInfoToBookingBenefit(
  benefitWithPlanInfo: BenefitWithPlanInfo,
): any {
  let bookingBenefit: BookingBenefit = null;
  if (benefitWithPlanInfo.benefit) {
    bookingBenefit = {
      id: benefitWithPlanInfo.benefit.id,
      type: mapBenefitTypeToBookingBenefitType(
        benefitWithPlanInfo.benefit.benefitType,
      ),
      includedServices: benefitWithPlanInfo.benefit.resourceIds || [],
      numOfSessions: benefitWithPlanInfo.benefit.creditAmount || 0,
    };
  }
  return bookingBenefit ? [bookingBenefit] : null;
  // return {
  //   planId: benefitWithPlanInfo.planInfo.id,
  //   purchased: benefitWithPlanInfo.planInfo.hasOrders,
  //   benefits: bookingBenefit ? [bookingBenefit] : null,
  // };
}

function mapBenefitTypeToBookingBenefitType(benefitType: BenefitType): string {
  switch (benefitType) {
    case 'LIMITED':
      return 'LIMITED';
    case 'UNLIMITED':
      return 'UNLIMITED';
    default:
      return 'UNDEFINED';
  }
}

function mapBookingBenefitTypeToBenefitType(benefitType: string): BenefitType {
  switch (benefitType) {
    case 'LIMITED':
      return 'LIMITED';
    case 'UNLIMITED':
      return 'UNLIMITED';
    case 'UNDEFINED':
    default:
      return 'UNDEFINED';
  }
}

export function mapUpdateBenefitsDTOToBenefit(
  updateBenefitDTO: UpdateBenefitsDTO,
): Benefit {
  const bookingsBenefit = updateBenefitDTO.benefits[0];
  const benefit: Benefit = {
    creditAmount: bookingsBenefit.numOfSessions,
    resourceIds: bookingsBenefit.includedServices,
    benefitType: mapBookingBenefitTypeToBenefitType(bookingsBenefit.type),
    id: bookingsBenefit.id ? bookingsBenefit.id : null,
  };
  return benefit;
}
