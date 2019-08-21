import { PaymentSelection } from '@wix/ambassador-bookings-server';
import { LABELED_PRICE } from '../dto/offerings/offerings.consts';
import { getPaymentSelectionBySchedules } from './payment-selection';
import * as Chance from 'chance';
import { aSchedule } from '@wix/ambassador-services-server/builders';
import { aPrice, aRate } from '@wix/ambassador-checkout-server/builders';

describe('PaymentSelection', () => {
  const chance = new Chance();
  const defaultPaymentSelection: PaymentSelection = {
    numberOfParticipants: 1,
  };

  const paymentSelectionWithLabeledPrice: PaymentSelection = {
    numberOfParticipants: 1,
    rateLabel: LABELED_PRICE,
  };

  it('no schedules', () => {
    const paymentSelection = getPaymentSelectionBySchedules(null);
    expect(paymentSelection).toEqual(defaultPaymentSelection);
  });

  it('schedule without labeled price', () => {
    const schedule = aSchedule()
      .withRate(
        aRate()
          .withLabeledPriceOptions({})
          .build(),
      )
      .build();
    const paymentSelection = getPaymentSelectionBySchedules([schedule]);
    expect(paymentSelection).toEqual(defaultPaymentSelection);
  });

  it('schedule with labeled price', () => {
    const schedule = aSchedule()
      .withRate(
        aRate()
          .withLabeledPriceOptions({ [LABELED_PRICE]: aPrice().build() })
          .build(),
      )
      .build();
    const paymentSelection = getPaymentSelectionBySchedules([schedule]);
    expect(paymentSelection).toEqual(paymentSelectionWithLabeledPrice);
  });

  it('schedule with participants', () => {
    const noOfparticipants = chance.integer({ min: 0, max: 30 });
    const schedule = aSchedule()
      .withRate(
        aRate()
          .withLabeledPriceOptions({ [LABELED_PRICE]: aPrice().build() })
          .build(),
      )
      .build();
    const paymentSelection = getPaymentSelectionBySchedules(
      [schedule],
      noOfparticipants,
    );
    expect(paymentSelection.numberOfParticipants).toBe(noOfparticipants);
  });
});
