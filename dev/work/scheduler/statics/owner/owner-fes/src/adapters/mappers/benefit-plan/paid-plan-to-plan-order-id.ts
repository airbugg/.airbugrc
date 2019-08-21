import { PaidPlan } from '@wix/ambassador-bookings-server';
import * as btoa from 'btoa';
export function mapPaidPlanToBenefitOrderId(paidPlan: PaidPlan): string {
  return btoa(JSON.stringify(paidPlan));
}
