export interface OfferingBookInfo {
  price: { amount: number; currency: string; balanceDue: number };
  title: string;
  type: string;
}

export class Coupon {
  constructor(public name: string, public amountAfterDiscount: number) {}
}

export interface CustomerBookingDTO {
  id: string;
  sessionId?: string;
  start: number;
  end: number;
  staff: string;
  offering: OfferingBookInfo;
  payments: { offlinePayments: Payment[]; onlinePayments: Payment[] };
  pricingPlanName: string;
  coupon: Coupon;
  bookedAs?: 'PRICING_PLAN' | 'ONE_TIME';
}

export interface Payment {
  id: string;
  amount: number;
  date: number;
  paymentMethod: string;
}
