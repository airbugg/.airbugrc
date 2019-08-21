import {
  BookedEntity,
  BookedResource,
  Booking,
  PaymentDetails,
} from '@wix/ambassador-bookings-server/index';
import { Service } from '@wix/ambassador-services-catalog-server/rpc';
import { Session } from '@wix/ambassador-calendar-server/rpc';
import { LABELED_PRICE } from '../../../dto/offerings/offerings.consts';
import {
  Coupon,
  CustomerBookingDTO,
  Payment,
} from '../../../dto/booking/customer-booking.dto';
import * as moment from 'moment';
import { Rate } from '@wix/ambassador-schedule-server/rpc';
import { WixPayDetails } from '@wix/ambassador-bookings-server/types';

export const IN_PERSON_VENDOR: string = 'inPerson';

export function mapBookingToCustomerBooking(
  booking: Booking,
  service: Service,
  resource: BookedResource,
  experiments,
): CustomerBookingDTO {
  const session: Session | BookedEntity = booking.bookedEntity;
  const start = session.singleSession
    ? session.singleSession.start
    : session.setOfSessions.firstSessionStart;
  const end = session.singleSession
    ? session.singleSession.end
    : session.setOfSessions.lastSessionEnd;
  const sessionId = session.singleSession
    ? session.singleSession.sessionId
    : undefined;
  const res: CustomerBookingDTO = {
    id: booking.id,
    sessionId,
    start: moment(start).valueOf(),
    end: moment(end).valueOf(),
    offering: {
      title: service.info.name,
      type: getOfferingType(session.tags),
      price: getPriceInfo(session, booking.paymentDetails),
    },
    pricingPlanName: mapPlanName(booking.paymentDetails),
    coupon: mapCoupon(booking.paymentDetails),
    staff: resource.name,
    payments: mapPayment(experiments, booking.paymentDetails, session),
  };
  return res;
}

function getPriceInfo(
  session: BookedEntity,
  paymentDetails: PaymentDetails,
): any {
  const free = isFreeService(session.rate);
  if (free) {
    return {
      amount: 0,
      currency: 'USD',
      balanceDue: 0,
    };
  }
  if (paymentDetails.paidPlanDetails) {
    return {
      amount: 0,
      currency: 'USD',
      balanceDue: 0,
    };
  }
  return {
    amount:
      parseFloat(paymentDetails.balance.finalPrice.amount) +
      getAmountDiscountByCoupon(paymentDetails),
    currency: paymentDetails.balance.finalPrice.currency,
    balanceDue: paymentDetails.paidPlanDetails
      ? 0
      : parseFloat(paymentDetails.balance.finalPrice.amount) -
        parseFloat(paymentDetails.balance.amountReceived),
  };
}

function isFreeService(rate: Rate): boolean {
  return !(rate.labeledPriceOptions && rate.labeledPriceOptions[LABELED_PRICE]);
}

function mapPlanName(paymentDetails: PaymentDetails): string {
  if (paymentDetails.paidPlanDetails) {
    return paymentDetails.paidPlanDetails.planName;
  }
  return null;
}

function mapCoupon(paymentDetails: PaymentDetails): Coupon {
  if (hasCoupon(paymentDetails)) {
    return {
      name: paymentDetails.couponDetails.couponName,
      amountAfterDiscount: parseFloat(paymentDetails.balance.finalPrice.amount),
    };
    return null;
  }
}

function hasCoupon(paymentDetails: PaymentDetails): boolean {
  return paymentDetails.couponDetails ? true : false;
}

function getAmountDiscountByCoupon(paymentDetails: PaymentDetails) {
  return hasCoupon(paymentDetails)
    ? parseFloat(paymentDetails.couponDetails.couponDiscount)
    : 0;
}

function mapPayment(
  experiments,
  paymentDetails: PaymentDetails,
  session: BookedEntity,
) {
  if (experiments['specs.bookings.MultiplePayments'] === 'true') {
    return mapMultimapPayments(paymentDetails, session);
  }
  return mapObsoletePayment(paymentDetails, session);
}

function mapMultimapPayments(payments: PaymentDetails, session: BookedEntity) {
  const onlinePayments: Payment[] = [];
  const offlinePayments: Payment[] = [];
  if (isFreeService(session.rate)) {
    return {
      onlinePayments,
      offlinePayments,
    };
  }
  payments.wixPayMultipleDetails.forEach((wixPayments: WixPayDetails) => {
    if (wixPayments.paymentVendorName === IN_PERSON_VENDOR) {
      offlinePayments.push({
        id: null,
        amount: parseFloat(wixPayments.orderAmount),
        date: moment(wixPayments.orderApprovalTime).valueOf(),
        paymentMethod: null,
      });
    } else {
      onlinePayments.push({
        id: wixPayments.orderId,
        amount: parseFloat(wixPayments.orderAmount),
        date: moment(wixPayments.orderApprovalTime).valueOf(),
        paymentMethod: wixPayments.paymentVendorName,
      });
    }
  });
  return {
    onlinePayments,
    offlinePayments,
  };
}

function mapObsoletePayment(
  paymentDetails: PaymentDetails,
  session: BookedEntity,
) {
  if (isFreeService(session.rate)) {
    return {
      onlinePayments: [],
      offlinePayments: [],
    };
  }
  const amountReceived = paymentDetails.balance
    ? parseFloat(paymentDetails.balance.amountReceived)
    : 0;

  if (amountReceived === 0) {
    return {
      onlinePayments: [],
      offlinePayments: [],
    };
  }

  let onlinePayment: Payment = null;
  let offlinePayment: Payment = null;
  const payDetails = paymentDetails.wixPayDetails;
  const paymentAmount = payDetails ? parseFloat(payDetails.orderAmount) : 0;

  if (payDetails && paymentAmount > 0) {
    if (payDetails.paymentVendorName !== IN_PERSON_VENDOR) {
      onlinePayment = {
        id: payDetails.orderId,
        amount: paymentAmount,
        date: moment(payDetails.orderApprovalTime).valueOf(),
        paymentMethod: payDetails.paymentVendorName,
      };
    } else {
      offlinePayment = {
        id: null,
        amount: paymentAmount,
        date: moment(payDetails.orderApprovalTime).valueOf(),
        paymentMethod: null,
      };
    }
  }

  // as for now, amountReceived will be greater than paymentAmount only when online payment made and after owner has made offline payment
  // impossible to get here if offlinePayment set before
  if (amountReceived > paymentAmount) {
    offlinePayment = {
      id: null,
      amount: amountReceived - paymentAmount,
      date: moment().valueOf(),
      paymentMethod: null,
    };
  }

  return {
    onlinePayments: onlinePayment ? [onlinePayment] : [],
    offlinePayments: offlinePayment ? [offlinePayment] : [],
  };
}

function getOfferingType(tags: string[]) {
  return tags[0];
}
