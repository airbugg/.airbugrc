import {
  Booking,
  PaidPlanDetails,
  PaymentDetails,
} from '@wix/ambassador-bookings-server';
import { ParticipantItemDto } from '../../../dto/sessions/participant.dto';
import { PaymentType } from '../../../dto/offerings/offering.dto';
import { mapPaidPlanToBenefitOrderId } from '../benefit-plan/paid-plan-to-plan-order-id';

export function mapToBookingToParticipantDto(
  booking: Booking,
): ParticipantItemDto {
  const participantItemDto: ParticipantItemDto = {
    bookingId: booking.id,
    contactId: booking.formInfo.contactDetails.contactId,
    name: toFullName(
      booking.formInfo.contactDetails.firstName,
      booking.formInfo.contactDetails.lastName,
    ),
    numberOfParticipants:
      booking.formInfo.paymentSelection[0].numberOfParticipants,
    email: booking.formInfo.contactDetails.email,
    phone: booking.formInfo.contactDetails.phone,
    paymentType: toPaymentType(booking.paymentDetails),
  };
  addPlanInfoIfNeeded(
    booking.paymentDetails.paidPlanDetails,
    participantItemDto,
  );
  return participantItemDto;
}

function toFullName(firstname: string, lastname: string): string {
  return lastname ? `${firstname} ${lastname}` : firstname;
}

function addPlanInfoIfNeeded(
  paidPlanDetails: PaidPlanDetails,
  participantItemDto: ParticipantItemDto,
): any {
  if (paidPlanDetails) {
    participantItemDto.benefitOrderId = mapPaidPlanToBenefitOrderId(
      paidPlanDetails.plan,
    );
    participantItemDto.pricingPlanOrderInfo = {
      name: paidPlanDetails.planName,
    };
  }
}

function toPaymentType(paymentDetails: PaymentDetails): PaymentType {
  if (
    paymentDetails.wixPayDetails &&
    parseFloat(paymentDetails.balance.finalPrice.amount) ===
      parseFloat(paymentDetails.wixPayDetails.orderAmount)
  ) {
    return PaymentType.ONLINE;
  }
  if (
    paymentDetails.wixPayDetails &&
    parseFloat(paymentDetails.balance.amountReceived) === 0
  ) {
    return PaymentType.OFFLINE;
  }
  if (!paymentDetails.wixPayDetails) {
    return PaymentType.OFFLINE;
  }
  return PaymentType.ALL;
}
