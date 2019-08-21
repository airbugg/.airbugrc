import {
  EditedParticipant,
  ParticipantInSessionDto,
  ParticipantItemDto,
  UpdateParticipantItemDto,
} from '../../dto/sessions/participant.dto';
import {
  BookRequest,
  FormInfo,
  PaymentSelection,
  Rate,
  UpdateBookingRequest,
} from '@wix/ambassador-bookings-server';
import { mapBenefitOrderIdToPaidPlan } from './benefit-plan/benefit-order-Id-to-pricing-plan';
import { getPaymentSelectionByRate } from '../payment-selection';

export function convertParticipantToBookRequest(
  participantInSessionDto: ParticipantInSessionDto,
  sessionId: string,
  scheduleId: string,
  sendEmail: boolean,
  rate: Rate = null,
): BookRequest {
  const formInfo: FormInfo = extractContactInfo(
    participantInSessionDto.participant,
    rate,
  );

  const paidPlanData = participantInSessionDto.benefitOrderId
    ? mapBenefitOrderIdToPaidPlan(participantInSessionDto.benefitOrderId)
    : null;
  const request: BookRequest = {
    formInfo,
    sessionId,
    scheduleId,
    planSelection: paidPlanData,
    notifyParticipants: sendEmail,
  };

  return request;
}

export function convertParticipantToUpdateBookingRequest(
  participantItemDto: UpdateParticipantItemDto,
  bookingId: string,
): UpdateBookingRequest {
  const formInfo: FormInfo = extractContactInfo(
    participantItemDto.editedParticipant,
  );
  formInfo.contactDetails.email = participantItemDto.participantId.email; // otherwise it wil be deleted
  const request: UpdateBookingRequest = {
    id: bookingId,
    formInfo,
    fieldMask: { paths: ['formInfo'] },
    notifyParticipants: false,
  };

  return request;
}

function extractContactInfo(
  participantItemDto: ParticipantItemDto | EditedParticipant,
  rate: Rate = null,
): FormInfo {
  const participant = participantItemDto as ParticipantItemDto;
  const fullName = participant.name
    ? participant.name
    : (participantItemDto as EditedParticipant).fullName; // TODO: change request from owner to use name instead of fullname..

  const paymentSelection: PaymentSelection[] = [
    getPaymentSelectionByRate(rate, participant.numberOfParticipants),
  ];

  return {
    contactDetails: {
      firstName: extractFirstName(fullName),
      lastName: extractLastName(fullName),
      contactId: participant.contactId,
      email: participant.email,
      phone: participantItemDto.phone,
    },
    paymentSelection,
    customFormFields: null,
  };
}

function extractFirstName(fullName: string) {
  return !fullName ? '' : fullName.split(' ')[0];
}

function extractLastName(fullName: string) {
  const splittedName = !fullName ? '' : fullName.split(/ (.+)/);

  return splittedName.length > 1 ? splittedName[1] : '';
}
