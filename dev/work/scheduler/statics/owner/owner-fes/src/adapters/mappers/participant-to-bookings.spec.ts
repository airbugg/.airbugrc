import { Chance } from 'chance';
import { ParticipantItemDtoBuilder } from '../../../test/builders/dto/participant-item.dto.builder';
import { ParticipantItemDto } from '../../dto/sessions/participant.dto';
import { convertParticipantToBookRequest } from './participant-to-bookings';
import { BookRequest, PaidPlan, Rate } from '@wix/ambassador-bookings-server';
import { LABELED_PRICE } from '../../dto/offerings/offerings.consts';
import { mapPaidPlanToBenefitOrderId } from './benefit-plan/paid-plan-to-plan-order-id';
import { aPaidPlan, aPrice } from '@wix/ambassador-checkout-server/builders';

describe('participant to booking', () => {
  const chance = new Chance();

  it('converts participant to add to session booking request', () => {
    const participantItem: ParticipantItemDto = new ParticipantItemDtoBuilder().build();
    const sessionId: string = chance.guid();
    const scheduleId: string = chance.guid();
    const rate: Rate = {
      labeledPriceOptions: {},
    };
    const sendEmail = chance.bool();

    const participantInSession = {
      participant: participantItem,
      registrationType: 'SINGLE_SESSION',
      sendEmail,
    };

    const bookReq: BookRequest = convertParticipantToBookRequest(
      participantInSession,
      sessionId,
      scheduleId,
      sendEmail,
      rate,
    );
    expect(bookReq.sessionId).toBe(sessionId); //todo not sure about this one, need to check
    expect(bookReq.scheduleId).toBe(scheduleId);
    expect(bookReq.formInfo.contactDetails.email).toBe(participantItem.email);
    expect(bookReq.formInfo.contactDetails.phone).toBe(participantItem.phone);
    expect(bookReq.formInfo.contactDetails.contactId).toBe(
      participantItem.contactId,
    );
    expect(
      `${bookReq.formInfo.contactDetails.firstName} ${bookReq.formInfo.contactDetails.lastName}`,
    ).toBe(participantItem.name);
    expect(bookReq.formInfo.paymentSelection[0].numberOfParticipants).toBe(
      participantItem.numberOfParticipants,
    );
    expect(bookReq.formInfo.paymentSelection[0].rateLabel).toBeUndefined();
    expect(bookReq.notifyParticipants).toBe(sendEmail);
  });

  it('converts participant with rate and labeled price', () => {
    const participantItem: ParticipantItemDto = new ParticipantItemDtoBuilder().build();
    const sessionId: string = chance.guid();
    const scheduleId: string = chance.guid();
    const rate: Rate = {
      labeledPriceOptions: {
        [LABELED_PRICE]: aPrice().build(),
      },
    };

    const participantInSession = {
      participant: participantItem,
      registrationType: 'coco',
      sendEmail: false,
    };

    const bookReq: BookRequest = convertParticipantToBookRequest(
      participantInSession,
      sessionId,
      scheduleId,
      chance.bool(),
      rate,
    );

    expect(bookReq.formInfo.paymentSelection[0].rateLabel).toBe(LABELED_PRICE);
  });

  it('converts participant with pricing plan to add to session booking request', () => {
    const paidPlan: PaidPlan = aPaidPlan()
      .withBenefitId(chance.guid())
      .withOrderId(chance.guid())
      .build();
    const participantItem: ParticipantItemDto = new ParticipantItemDtoBuilder().build();
    const sessionId: string = chance.guid();
    const scheduleId: string = chance.guid();

    const participantInSession = {
      participant: participantItem,
      registrationType: 'coco',
      benefitOrderId: mapPaidPlanToBenefitOrderId(paidPlan),
      sendEmail: false,
    };

    const bookReq: BookRequest = convertParticipantToBookRequest(
      participantInSession,
      sessionId,
      scheduleId,
      chance.bool(),
    );
    const expectedPlan = bookReq.planSelection;
    expect(expectedPlan.benefitId).toBe(paidPlan.benefitId);
    expect(expectedPlan.orderId).toBe(paidPlan.orderId);
  });
});
