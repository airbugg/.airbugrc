import { aSession } from '@wix/ambassador-calendar-server/builders';
import { getSessionParticipants } from './bookings-adapter';
import { OfferingTypes } from '../../dto/offerings/offerings.consts';

import {
  createABooking,
  withOnLinePayment,
} from '../../../test/builders/rpc-custom/booking-builder';
import { Chance } from 'chance';
import { aParticipant } from '@wix/ambassador-checkout-server/builders';
import { aSchedule } from '@wix/ambassador-services-server/builders';
import {
  aListBookingEntry,
  aListBookingsResponse,
} from '@wix/ambassador-bookings-server/builders';
const chance = new Chance();
describe('bookings adapter', () => {
  it('gets all participants for a session', async () => {
    const numberOfReservations = 3;
    const reservations = Array(numberOfReservations).fill(
      aParticipant().build(),
    );
    const dummySession = aSession()
      .withParticipants(reservations)
      .withTags([OfferingTypes.COURSE])
      .build();
    const getSessionMock = async (sessionId: string) =>
      Promise.resolve({ session: dummySession });
    const priceAmount = chance
      .floating({ min: 0, max: 100, fixed: 2 })
      .toString();

    const booking = withOnLinePayment(
      createABooking(priceAmount),
      priceAmount,
    ).build();
    const listBookingResponse = aListBookingsResponse()
      .withBookingsEntries([
        aListBookingEntry()
          .withBooking(booking)
          .build(),
      ])
      .build();
    const participants = await getSessionParticipants(
      dummySession.id,
      getSessionMock,
      async () => null,
      async () => listBookingResponse,
    );

    expect(participants.length).toBe(1);
  });

  it('gets all participants for a course', async () => {
    const numberOfReservations = 4;
    const reservations = Array(numberOfReservations).fill(
      aParticipant().build(),
    );
    const priceAmount = chance
      .floating({ min: 0, max: 100, fixed: 2 })
      .toString();
    const dummySchedule = aSchedule()
      .withParticipants(reservations)
      .build();

    const getScheduleMock = async (scheduleId: string) =>
      Promise.resolve({ schedule: dummySchedule });

    const dummySession = aSession()
      .withParticipants([])
      .withTags([OfferingTypes.COURSE])
      .build();

    const getSessionMock = async (sessionId: string) =>
      Promise.resolve({ session: dummySession });
    const booking = withOnLinePayment(
      createABooking(priceAmount),
      priceAmount,
    ).build();
    const listBookingResponse = aListBookingsResponse()
      .withBookingsEntries([
        aListBookingEntry()
          .withBooking(booking)
          .build(),
      ])
      .build();

    const participants = await getSessionParticipants(
      dummySession.id,
      getSessionMock,
      async () => null,
      async () => listBookingResponse,
    );

    expect(participants.length).toBe(1);
  });
});
