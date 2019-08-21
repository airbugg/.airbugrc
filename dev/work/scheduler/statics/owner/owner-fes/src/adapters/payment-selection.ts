import { Schedule } from '@wix/ambassador-schedule-server/rpc';
import { PaymentSelection, Rate } from '@wix/ambassador-bookings-server';
import { LABELED_PRICE } from '../dto/offerings/offerings.consts';

function getDefaultPaymentSelection(numberOfParticipants: number = 1) {
  return {
    numberOfParticipants,
  };
}

export function getPaymentSelectionBySchedules(
  schedules: Schedule[],
  numberOfParticipants = 1,
): PaymentSelection {
  const paymentSelection: PaymentSelection = getDefaultPaymentSelection(
    numberOfParticipants,
  );

  if (schedules && schedules[0]) {
    return getPaymentSelectionByRate(schedules[0].rate, numberOfParticipants);
  }

  return paymentSelection;
}

export function getPaymentSelectionByRate(
  rate: Rate,
  numberOfParticipants = 1,
): PaymentSelection {
  const paymentSelection: PaymentSelection = getDefaultPaymentSelection(
    numberOfParticipants,
  );

  if (
    rate &&
    rate.labeledPriceOptions &&
    rate.labeledPriceOptions[LABELED_PRICE]
  ) {
    paymentSelection.rateLabel = LABELED_PRICE;
  }

  return paymentSelection;
}
