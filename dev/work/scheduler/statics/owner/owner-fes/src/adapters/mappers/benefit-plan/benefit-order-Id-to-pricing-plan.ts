import { PaidPlan } from '@wix/ambassador-bookings-server';
import * as atob from 'atob';

export function mapBenefitOrderIdToPaidPlan(benefitOrderId: string): PaidPlan {
  return JSON.parse(atob(benefitOrderId));
}
