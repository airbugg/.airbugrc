import {
  createAppointmentBookings,
  createSessionBooking,
  getSessionParticipants,
  cancelBooking,
  updateSessionBooking,
} from '../adapters/bookings/bookings-adapter';
import {
  createBookFactory,
  getterOfSessionByIdFactory,
  cancelBookFactory,
  updateBookFactory,
  getterOfBookingsBySessionIdFactory,
  getterOfBookingsByScheduleIdFactory,
  getterOfScheduleByIdFactory,
} from '../adapters/bookings/bookings-adapter-rpc';
import {
  ParticipantInSessionDto,
  UpdateParticipantItemDto,
} from '../dto/sessions/participant.dto';
import { Booking } from '@wix/ambassador-bookings-server';

export async function createAppointments(req, res, next) {
  const booking = await createAppointmentBookings(req.aspects, req.body);
  res.send({ booking });
}

export async function getParticipantsForSession(req, res, next) {
  const sessionId: string = req.params.sessionId;

  const participants = await getSessionParticipants(
    sessionId,
    getterOfSessionByIdFactory(req.aspects),
    getterOfBookingsBySessionIdFactory(req.aspects),
    getterOfBookingsByScheduleIdFactory(req.aspects),
  );
  res.send({ participants });
}

export async function addParticipantToSession(req, res, next) {
  const sessionId: string = req.params.sessionId;
  const addedParticipant: ParticipantInSessionDto = req.body;
  const booking: Booking = await createSessionBooking(
    sessionId,
    addedParticipant,
    createBookFactory(req.aspects),
    getterOfSessionByIdFactory(req.aspects),
    getterOfScheduleByIdFactory(req.aspects),
  );

  res.send({
    bookingId: booking.id,
    contactId: booking.formInfo.contactDetails.contactId,
  });
}

export async function updateParticipantInBooking(req, res, next) {
  const sessionId: string = req.params.sessionId;
  const bookingId: string = req.params.bookingId;
  const updatedParticipant: UpdateParticipantItemDto = req.body;
  await updateSessionBooking(
    bookingId,
    updatedParticipant,
    updateBookFactory(req.aspects),
    getterOfSessionByIdFactory(req.aspects),
  );

  res.sendStatus(200);
}

export async function removeParticipantFromSession(req, res, next) {
  const sessionId: string = req.params.sessionId;

  let notifyParticipants = true; //default for not fitness
  if (req.body && req.body.notifyParticipants !== undefined) {
    notifyParticipants = !!req.body.notifyParticipants;
  }

  await cancelBooking(
    req.params.bookingId,
    notifyParticipants,
    cancelBookFactory(req.aspects),
  );

  res.sendStatus(200);
}
