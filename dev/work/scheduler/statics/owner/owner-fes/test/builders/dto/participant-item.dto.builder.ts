import { Chance } from 'chance';
import { ParticipantItemDto } from '../../../src/dto/sessions/participant.dto';
import { PaymentType } from '../../../src/dto/offerings/offering.dto';

const chance = Chance();

function validParticipantItemDto(): ParticipantItemDto {
  return {
    bookingId: chance.guid(),
    contactId: chance.guid(),
    name: 'some participant name',
    numberOfParticipants: 34,
    email: 'participant@wix.com',
    phone: '342534253453245',
    paymentType: PaymentType.OFFLINE,
  };
}

export class ParticipantItemDtoBuilder {
  participantItemDto: ParticipantItemDto = { ...validParticipantItemDto() };

  withBookingId(bookingId) {
    this.participantItemDto.bookingId = bookingId;
    return this;
  }

  withContactId(contactId) {
    this.participantItemDto.contactId = contactId;
    return this;
  }

  empty() {
    this.participantItemDto = {} as ParticipantItemDto;
    return this;
  }

  withName(name) {
    this.participantItemDto.name = name;
    return this;
  }

  withNumberOfParticipants(numberOfParticipants) {
    this.participantItemDto.numberOfParticipants = numberOfParticipants;
    return this;
  }

  withEmail(email) {
    this.participantItemDto.email = email;
    return this;
  }

  withPhone(phone) {
    this.participantItemDto.phone = phone;
    return this;
  }

  withPaymentType(paymentType) {
    this.participantItemDto.paymentType = paymentType;
    return this;
  }
  withPricingPlan(pricingPlanName: string) {
    this.participantItemDto.pricingPlanOrderInfo = { name: pricingPlanName };
    return this;
  }
  withBenefitOrderId(benefitOrderId: string) {
    this.participantItemDto.benefitOrderId = benefitOrderId;
    return this;
  }

  build() {
    return this.participantItemDto;
  }
}
