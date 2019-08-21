import {
  createABooking,
  withOnLinePayment,
} from '../../../../test/builders/rpc-custom/booking-builder';
import { Chance } from 'chance';
import { mapToBookingToParticipantDto } from './booking-to-participant-dto';
import { ParticipantItemDto } from '../../../dto/sessions/participant.dto';
import { PaymentType } from '../../../dto/offerings/offering.dto';
import { BookingDTOBuilder } from '@wix/ambassador-bookings-server';

const chance = new Chance();
describe('map of booking to participant DTO', () => {
  it('should map booking to participant DTO', () => {
    const priceAmount = chance
      .floating({ min: 0, max: 100, fixed: 2 })
      .toString();
    const bookingBuilder: BookingDTOBuilder = withOnLinePayment(
      createABooking(priceAmount),
      priceAmount,
    );
    const booking = bookingBuilder.build();
    booking.formInfo.contactDetails.lastName = chance.name();
    booking.formInfo.contactDetails.firstName = chance.name();
    const participant: ParticipantItemDto = mapToBookingToParticipantDto(
      booking,
    );
    expect(participant.numberOfParticipants).toBe(
      booking.formInfo.paymentSelection[0].numberOfParticipants,
    );
    expect(participant.bookingId).toBe(booking.id);
    expect(participant.email).toBe(booking.formInfo.contactDetails.email);
    expect(participant.phone).toBe(booking.formInfo.contactDetails.phone);
    expect(participant.contactId).toBe(
      booking.formInfo.contactDetails.contactId,
    );
    expect(participant.name).toContain(
      booking.formInfo.contactDetails.lastName,
    );
    expect(participant.name).toContain(
      booking.formInfo.contactDetails.firstName,
    );
    expect(participant.paymentType).toBe(PaymentType.ONLINE);
  });
});
