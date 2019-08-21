import {
  createABooking,
  withMultiplePayment,
  withOnLinePayment,
} from '../../../../test/builders/rpc-custom/booking-builder';
import { Chance } from 'chance';
import { createAService } from '../../../../test/builders/rpc-custom/service';
import { mapBookingToCustomerBooking } from './bookings-to-customer-booking';
import {
  CustomerBookingDTO,
  Payment,
} from '../../../dto/booking/customer-booking.dto';
import { OfferingTypes } from '../../../dto/offerings/offerings.consts';
import * as moment from 'moment';
import {
  aCouponDetails,
  aPaidPlan,
  aPaidPlanDetails,
  aRate,
} from '@wix/ambassador-checkout-server/builders';
import { aBookedResource } from '@wix/ambassador-bookings-server/builders';

const chance = new Chance();

describe('map Booking to CustomerBooking', () => {
  let experiments;

  describe('should work with multiple payment details specs.bookings.MultiplePayments - true', () => {
    beforeEach(() => {
      experiments = { 'specs.bookings.MultiplePayments': 'true' };
    });

    function getDataForBooking(
      priceAmount: string,
      deposit: string,
      paidOffline: string,
    ) {
      const booking = withMultiplePayment(
        createABooking(priceAmount),
        paidOffline,
        deposit,
      ).build();
      booking.bookedEntity.tags = [OfferingTypes.GROUP];
      const service = createAService().build();
      const resource = aBookedResource().build();
      return { booking, service, resource };
    }

    it('should have online and offline payments', () => {
      const deposit = '25';
      const paidOffline = '75';
      const priceAmount = '100';
      const data = getDataForBooking(priceAmount, deposit, paidOffline);
      const customerBookings: CustomerBookingDTO = mapBookingToCustomerBooking(
        data.booking,
        data.service,
        data.resource,
        experiments,
      );
      expect(
        customerBookings.payments.onlinePayments[0].amount.toString(),
      ).toBe(deposit);
      expect(
        customerBookings.payments.offlinePayments[0].amount.toString(),
      ).toBe(paidOffline);
    });

    it('should map full paid onLine', () => {
      const paidOnline = '100';
      const paidOffline = '0';
      const priceAmount = '100';
      const data = getDataForBooking(priceAmount, paidOnline, paidOffline);
      const customerBookings: CustomerBookingDTO = mapBookingToCustomerBooking(
        data.booking,
        data.service,
        data.resource,
        experiments,
      );
      const onLinePayment = customerBookings.payments.onlinePayments[0];
      expect(data.booking.paymentDetails.balance.amountReceived).toEqual(
        data.booking.paymentDetails.balance.finalPrice.amount,
      );
      expect(onLinePayment.amount.toString()).toBe(
        data.booking.paymentDetails.balance.amountReceived,
      );
      expect(onLinePayment.paymentMethod).toBe(
        data.booking.paymentDetails.wixPayMultipleDetails[0].paymentVendorName,
      );
      expect(new Date(onLinePayment.date).toISOString()).toBe(
        data.booking.paymentDetails.wixPayMultipleDetails[0].orderApprovalTime,
      );
    });

    it('should map book of free service', () => {
      const data = getDataForBooking('0', '0', '0');
      const start = moment().toISOString();
      const end = moment()
        .add(60, 'm')
        .toISOString();

      const rate = aRate()
        .withPriceText(chance.string())
        .withLabeledPriceOptions(null)
        .build();
      data.booking.bookedEntity.rate = rate;
      data.booking.paymentDetails.balance.amountReceived = '0';
      const customerBookings: CustomerBookingDTO = mapBookingToCustomerBooking(
        data.booking,
        data.service,
        data.resource,
        experiments,
      );
      expect(customerBookings.payments.onlinePayments.length).toBe(0);
      expect(customerBookings.payments.onlinePayments.length).toBe(0);
      expect(customerBookings.offering.price.balanceDue).toBe(0);
      expect(customerBookings.offering.price.amount).toBe(0);
    });
  });

  describe('specs.bookings.MultiplePayments - false', () => {
    beforeEach(() => {
      experiments = {};
    });

    function getDataForBooking() {
      const priceAmount = chance
        .floating({ min: 0, max: 100, fixed: 2 })
        .toString();
      const booking = withOnLinePayment(
        createABooking(priceAmount),
        priceAmount,
      ).build();
      booking.bookedEntity.tags = [OfferingTypes.GROUP];
      const service = createAService().build();
      const resource = aBookedResource().build();
      return { booking, service, resource };
    }

    it('should map service info to the bookings', () => {
      const data = getDataForBooking();
      delete data.booking.paymentDetails.couponDetails;
      const customerBookings: CustomerBookingDTO = mapBookingToCustomerBooking(
        data.booking,
        data.service,
        data.resource,
        experiments,
      );
      expect(customerBookings.offering.title).toBe(data.service.info.name);
      expect(customerBookings.offering.price.amount.toString()).toBe(
        data.booking.paymentDetails.balance.finalPrice.amount,
      );
      expect(customerBookings.offering.type).toBe(OfferingTypes.GROUP);
    });

    it('should map basic bookings info', () => {
      const data = getDataForBooking();
      const customerBookings: CustomerBookingDTO = mapBookingToCustomerBooking(
        data.booking,
        data.service,
        data.resource,
        experiments,
      );
      expect(customerBookings.id).toBe(data.booking.id);
      expect(customerBookings.sessionId).toBe(
        data.booking.bookedEntity.singleSession.sessionId,
      );
      expect(customerBookings.start).toBe(
        moment(data.booking.bookedEntity.singleSession.start).valueOf(),
      );
      expect(customerBookings.end).toBe(
        moment(data.booking.bookedEntity.singleSession.end).valueOf(),
      );
      expect(customerBookings.staff).toBe(data.resource.name);
    });

    it('should map full paid onLine', () => {
      const data = getDataForBooking();
      const customerBookings: CustomerBookingDTO = mapBookingToCustomerBooking(
        data.booking,
        data.service,
        data.resource,
        experiments,
      );
      const onLinePayment = customerBookings.payments.onlinePayments[0];
      expect(data.booking.paymentDetails.balance.amountReceived).toEqual(
        data.booking.paymentDetails.balance.finalPrice.amount,
      );
      expect(onLinePayment.amount.toString()).toBe(
        data.booking.paymentDetails.balance.amountReceived,
      );
      expect(onLinePayment.paymentMethod).toBe(
        data.booking.paymentDetails.wixPayDetails.paymentVendorName,
      );
      expect(new Date(onLinePayment.date).toISOString()).toBe(
        data.booking.paymentDetails.wixPayDetails.orderApprovalTime,
      );
    });

    it('should map paid deposit online ', () => {
      const data = getDataForBooking();
      data.booking.paymentDetails.balance.amountReceived = (
        parseFloat(data.booking.paymentDetails.balance.finalPrice.amount) - 10
      ).toString();
      const customerBookings: CustomerBookingDTO = mapBookingToCustomerBooking(
        data.booking,
        data.service,
        data.resource,
        experiments,
      );
      expect(customerBookings.offering.price.balanceDue).toEqual(
        parseFloat(data.booking.paymentDetails.balance.finalPrice.amount) -
          parseFloat(data.booking.paymentDetails.balance.amountReceived),
      );
    });

    it('should add coupons info', () => {
      const discount = chance
        .floating({ min: 0, max: 100, fixed: 2 })
        .toString();
      const data = getDataForBooking();
      const coupon = aCouponDetails()
        .withCouponCode(chance.guid())
        .withCouponDiscount(discount)
        .withCouponName(chance.string())
        .build();
      data.booking.paymentDetails.couponDetails = coupon;
      const customerBookings: CustomerBookingDTO = mapBookingToCustomerBooking(
        data.booking,
        data.service,
        data.resource,
        experiments,
      );
      expect(customerBookings.coupon.name).toBe(coupon.couponName);
      expect(customerBookings.coupon.amountAfterDiscount).toBe(
        parseFloat(data.booking.paymentDetails.balance.finalPrice.amount),
      );
      const nonDiscountPrice =
        parseFloat(data.booking.paymentDetails.balance.finalPrice.amount) +
        parseFloat(discount);
      expect(customerBookings.offering.price.amount).toBe(nonDiscountPrice);
      expect(customerBookings.payments.onlinePayments[0].amount).toBe(
        parseFloat(data.booking.paymentDetails.balance.finalPrice.amount),
      );
    });

    it('should return not paid booked by owner', async () => {
      const discount = chance
        .floating({ min: 0, max: 100, fixed: 2 })
        .toString();
      const data = getDataForBooking();
      data.booking.paymentDetails.balance.amountReceived = '0';
      delete data.booking.paymentDetails.wixPayDetails;
      const customerBookings: CustomerBookingDTO = mapBookingToCustomerBooking(
        data.booking,
        data.service,
        data.resource,
        experiments,
      );
      const offlinePayment: Payment =
        customerBookings.payments.offlinePayments[0];
      expect(customerBookings.payments.onlinePayments.length).toBe(0);
      expect(customerBookings.payments.offlinePayments.length).toBe(0);
    });

    it('should add pricing plan info', () => {
      const discount = chance
        .floating({ min: 0, max: 100, fixed: 2 })
        .toString();
      const data = getDataForBooking();
      const paidPlansBenefit = aPaidPlanDetails()
        .withPlanName(chance.string())
        .withPlan(aPaidPlan().build())
        .build();
      data.booking.paymentDetails.paidPlanDetails = paidPlansBenefit;
      const customerBookings: CustomerBookingDTO = mapBookingToCustomerBooking(
        data.booking,
        data.service,
        data.resource,
        experiments,
      );
      expect(customerBookings.pricingPlanName).toBe(paidPlansBenefit.planName);
    });

    it('should map book of free service', () => {
      const data = getDataForBooking();
      const start = moment().toISOString();
      const end = moment()
        .add(60, 'm')
        .toISOString();

      const rate = aRate()
        .withPriceText(chance.string())
        .withLabeledPriceOptions(null)
        .build();
      data.booking.bookedEntity.rate = rate;
      data.booking.paymentDetails.balance.amountReceived = '0';
      const customerBookings: CustomerBookingDTO = mapBookingToCustomerBooking(
        data.booking,
        data.service,
        data.resource,
        experiments,
      );
      expect(customerBookings.payments.onlinePayments.length).toBe(0);
      expect(customerBookings.payments.onlinePayments.length).toBe(0);
      expect(customerBookings.offering.price.balanceDue).toBe(0);
      expect(customerBookings.offering.price.amount).toBe(0);
    });
  });
});
