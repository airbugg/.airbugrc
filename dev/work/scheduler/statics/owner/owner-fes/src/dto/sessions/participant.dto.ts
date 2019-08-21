import { PaymentType } from '../offerings/offering.dto';

export interface ParticipantItemDto {
  bookingId: string;
  contactId: string;
  name: string;
  numberOfParticipants: number;
  email: string;
  phone: string;
  paymentType: PaymentType;
  benefitOrderId?: string;
  pricingPlanOrderInfo?: {
    name: string;
  };
}

export interface EditedParticipant {
  fullName: string;
  phone: string;
  numberOfParticipants: number;
}

export interface UpdateParticipantItemDto {
  participantId: {
    email: string;
  };
  editedParticipant: EditedParticipant;
  registrationType: string;
}

export interface ParticipantInSessionDto {
  participant: ParticipantItemDto;
  registrationType: string;
  benefitOrderId?: string;
  sendEmail: boolean;
}
