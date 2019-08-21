import { mapAppointmentToBookRequest } from '../mappers/appointment-to-bookings';

import {
  createBook,
  GetterOfBookingsByScheduleId,
  GetterOfBookingsBySessionId,
  GetterOfScheduleById,
  GetterOfSessionById,
} from './bookings-adapter-rpc';
import { getStaffById } from '../resources/resources-adapter';
import {
  Booking,
  BookRequest,
  BookResponse,
  CancelBookingRequest,
  CancelBookingResponse,
  ListBookingEntry,
  ListBookingsResponse,
  UpdateBookingRequest,
  UpdateBookingResponse,
} from '@wix/ambassador-bookings-server/rpc';
import {
  GetScheduleResponse,
  GetSessionResponse,
  Session,
} from '@wix/ambassador-schedule-server/rpc';
import {
  ParticipantInSessionDto,
  ParticipantItemDto,
  UpdateParticipantItemDto,
} from '../../dto/sessions/participant.dto';
import {
  convertParticipantToBookRequest,
  convertParticipantToUpdateBookingRequest,
} from '../mappers/participant-to-bookings';
import { OfferingTypes } from '../../dto/offerings/offerings.consts';
import { mapToBookingToParticipantDto } from '../mappers/bookings/booking-to-participant-dto';
import { getterOfServiceByIdFactory } from '../offerings/services-catalog-rpc';

async function getScheduleId(aspects, serviceId: string): Promise<string> {
  const getServiceResponse = await getterOfServiceByIdFactory(aspects)(
    serviceId,
  );
  return getServiceResponse.service.scheduleIds[0];
}

export async function createAppointmentBookings(aspects, appointment) {
  const getServiceResponse = await getterOfServiceByIdFactory(aspects)(
    appointment.serviceId,
  );
  const staff = await getStaffById(aspects, appointment.staffMemberId);

  const bookRequest: BookRequest = mapAppointmentToBookRequest(
    appointment,
    getServiceResponse,
    staff,
  );
  bookRequest.createSession.scheduleId =
    getServiceResponse.service.scheduleIds[0];
  const createdBookings: BookResponse = await createBook(aspects, bookRequest);
  return createdBookings.booking;
}

export async function getSessionBookingEntries(
  session: Session,
  getterOfBookingsBySessionId: GetterOfBookingsBySessionId,
  getterOfBookingsByScheduleId: GetterOfBookingsByScheduleId,
): Promise<ListBookingEntry[]> {
  const listBookingsResponse = await getBookingsBySessionType(
    session,
    getterOfBookingsBySessionId,
    getterOfBookingsByScheduleId,
  );

  return listBookingsResponse.bookingsEntries || [];
}

export async function getSessionParticipants(
  sessionId: string,
  getSessionById: GetterOfSessionById,
  getterOfBookingsBySessionId: GetterOfBookingsBySessionId,
  getterOfBookingsByScheduleId: GetterOfBookingsByScheduleId,
) {
  const sessionsRes: GetSessionResponse = await getSessionById(sessionId);

  const sessionBookings = await getSessionBookingEntries(
    sessionsRes.session,
    getterOfBookingsBySessionId,
    getterOfBookingsByScheduleId,
  );
  const participants: ParticipantItemDto[] = sessionBookings
    ? sessionBookings.map((listBookingEntry: ListBookingEntry) =>
        mapToBookingToParticipantDto(listBookingEntry.booking),
      )
    : [];
  return participants;
}

async function getBookingsBySessionType(
  session: Session,
  getterOfBookingsBySessionId: (
    sessionId: string,
  ) => Promise<ListBookingsResponse>,
  getterOfBookingsByScheduleId: (
    scheduleId: string,
  ) => Promise<ListBookingsResponse>,
) {
  let listBookingsResponse: ListBookingsResponse;
  if (session.tags && session.tags.includes(OfferingTypes.COURSE)) {
    listBookingsResponse = await getterOfBookingsByScheduleId(
      session.scheduleId,
    );
  } else {
    listBookingsResponse = await getterOfBookingsBySessionId(session.id);
  }
  return listBookingsResponse;
}

async function getReservationsBySessionType(
  sessionsRes: GetSessionResponse,
  getSchedule: (scheduleId: string) => Promise<GetScheduleResponse>,
) {
  if (
    sessionsRes.session.tags &&
    sessionsRes.session.tags.includes(OfferingTypes.COURSE)
  ) {
    const scheduleRes = await getSchedule(sessionsRes.session.scheduleId);
    return scheduleRes.schedule.participants || [];
  }

  return sessionsRes.session && sessionsRes.session.participants
    ? sessionsRes.session.participants
    : [];
}

export async function createSessionBooking(
  sessionId: string,
  addedParticipantInSession: ParticipantInSessionDto,
  createBooking: (bookReq: BookRequest) => Promise<BookResponse>,
  getSessionById: GetterOfSessionById,
  getSchedule: GetterOfScheduleById,
): Promise<Booking> {
  const { session } = await getSessionById(sessionId);
  let scheduleId = null;
  let rate = null;

  if (session.tags.includes(OfferingTypes.COURSE)) {
    scheduleId = session.scheduleId;
    sessionId = null;
    rate = session.rate;
  } else {
    const { schedule } = await getSchedule(session.scheduleId);
    rate = schedule.rate;
  }

  const bookReq: BookRequest = convertParticipantToBookRequest(
    addedParticipantInSession,
    sessionId,
    scheduleId,
    addedParticipantInSession.sendEmail,
    rate,
  );
  const bookRes: BookResponse = await createBooking(bookReq);

  return bookRes.booking;
}

export async function updateSessionBooking(
  bookingId: string,
  updatedParticipantInSession: UpdateParticipantItemDto,
  updateBooking: (
    bookReq: UpdateBookingRequest,
  ) => Promise<UpdateBookingResponse>,
  getSessionById: GetterOfSessionById,
): Promise<Booking> {
  const updateBookingReq: UpdateBookingRequest = convertParticipantToUpdateBookingRequest(
    updatedParticipantInSession,
    bookingId,
  );
  await updateBooking(updateBookingReq);

  return;
}

export async function cancelBooking(
  bookingId: string,
  notifyParticipants: boolean,
  cancelBook: (
    cancelBookingReq: CancelBookingRequest,
  ) => Promise<CancelBookingResponse>,
): Promise<CancelBookingResponse> {
  const cancelBookReq: CancelBookingRequest = {
    id: bookingId,
    notifyParticipants,
  };
  return cancelBook(cancelBookReq);
}
