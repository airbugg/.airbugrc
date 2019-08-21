import {
  aBalance,
  aBooking,
  aContactDetails,
  aFormInfo,
  aPaymentDetails,
  aPaymentSelection,
  aWixPayDetails,
  BookingDTOBuilder,
} from '@wix/ambassador-bookings-server/builders';
import { Chance } from 'chance';
import { aPrice, aRate } from '@wix/ambassador-calendar-server/builders';
import * as moment from 'moment';
import {
  LABELED_PRICE,
  OfferingTypes,
} from '../../../src/dto/offerings/offerings.consts';
import { aStaffResource } from './resource-builder';
import { aNineToFive7DaysAWeekSchedule } from './schedule-builder';
import { BookedEntity, BookedResource } from '@wix/ambassador-bookings-server';
import { IN_PERSON_VENDOR } from '../../../src/adapters/mappers/bookings/bookings-to-customer-booking';

const chance = new Chance();

export function createABooking(
  priceAmount: string = chance
    .floating({ min: 0, max: 100, fixed: 2 })
    .toString(),
  serviceId: string = chance.guid(),
) {
  const start = moment().toISOString();
  const end = moment()
    .add(60, 'm')
    .toISOString();
  const sessionId = chance.guid();
  const price = aPrice()
    .withAmount(priceAmount)
    .withCurrency(chance.currency().code)
    .withDownPayAmount('0')
    .build();
  const rate = aRate()
    .withLabeledPriceOptions({ [LABELED_PRICE]: price })
    .build();
  const session: BookedEntity = {
    rate,
    serviceId,
    tags: [OfferingTypes.INDIVIDUAL],
    scheduleId: null,
    singleSession: {
      start,
      end,
      sessionId,
    },
  };

  const bookingDTOBuilder = aBooking()
    .withBookedEntity(session)
    .withFormInfo(
      aFormInfo()
        .withPaymentSelection([
          aPaymentSelection()
            .withNumberOfParticipants(chance.natural())
            .build(),
        ])
        .withContactDetails(aContactDetails().build())
        .build(),
    )
    .withBookedResources([
      aStaffResource(aNineToFive7DaysAWeekSchedule()) as BookedResource,
    ])
    .withId(chance.guid());
  return bookingDTOBuilder;
}

export function withOnLinePayment(
  bookingDTOBuilder: BookingDTOBuilder,
  priceAmount: string = chance
    .floating({ min: 0, max: 100, fixed: 2 })
    .toString(),
) {
  const wixPayDetails = aWixPayDetails()
    .withOrderId(chance.guid())
    .withOrderAmount(priceAmount)
    .withOrderApprovalTime(new Date().toISOString())
    .build();
  const balance = aBalance()
    .withAmountReceived(priceAmount)
    .withFinalPrice(
      aPrice()
        .withCurrency(chance.currency().code)
        .withAmount(priceAmount)
        .build(),
    )
    .build();
  const paymentDetails = aPaymentDetails()
    .withWixPayDetails(wixPayDetails)
    .withPaidPlanDetails(null)
    .withBalance(balance)
    .withId(chance.guid())
    .withWixPayMultipleDetails([wixPayDetails])
    .build();
  bookingDTOBuilder.withPaymentDetails(paymentDetails);
  return bookingDTOBuilder;
}

export function withMultiplePayment(
  bookingDTOBuilder: BookingDTOBuilder,
  payedInPerson: string,
  deposit: string,
) {
  const payments = [];
  const onlineDepositPayment = aWixPayDetails()
    .withOrderId(chance.guid())
    .withOrderAmount(deposit)
    .withOrderApprovalTime(new Date().toISOString())
    .withPaymentVendorName('paypal')
    .build();
  payments.push(onlineDepositPayment);
  if (payedInPerson !== '0') {
    const markedAsPaidPayment = aWixPayDetails()
      .withOrderId(chance.guid())
      .withOrderAmount(payedInPerson)
      .withOrderApprovalTime(new Date().toISOString())
      .withPaymentVendorName(IN_PERSON_VENDOR)
      .build();
    payments.push(markedAsPaidPayment);
  }

  const amountReceived: number =
    parseFloat(payedInPerson) + parseFloat(deposit);
  const balance = aBalance()
    .withAmountReceived(amountReceived.toString())
    .withFinalPrice(
      aPrice()
        .withCurrency(chance.currency().code)
        .withAmount(amountReceived.toString())
        .build(),
    )
    .build();
  const paymentDetails = aPaymentDetails()
    .withPaidPlanDetails(null)
    .withBalance(balance)
    .withId(chance.guid())
    .withWixPayMultipleDetails(payments)
    .build();
  bookingDTOBuilder.withPaymentDetails(paymentDetails);
  return bookingDTOBuilder;
}
