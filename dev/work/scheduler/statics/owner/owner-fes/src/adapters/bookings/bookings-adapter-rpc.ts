import {
  BookingsServer,
  BookRequest,
  CancelBookingRequest,
  ListBookingsRequest,
  ListBookingsResponse,
  UpdateBookingRequest,
  UpdateBookingResponse,
} from '@wix/ambassador-bookings-server';
import { makeLogged } from '../rpc-executor';
import {
  GetScheduleResponse,
  GetSessionResponse,
  ScheduleServer,
} from '@wix/ambassador-schedule-server/rpc';
import { CancelBookingResponse } from '@wix/ambassador-bookings-server/types';

export async function createBook(aspects, bookReq: BookRequest) {
  return makeLogged(BookingsServer().Bookings()(aspects).book)(bookReq);
}
export declare type GetterOfBookingsByCustomerId = (
  customerId: string,
) => Promise<ListBookingsResponse>;
export function getterOfBookingsByCustomerIdFactory(
  aspects,
): GetterOfBookingsByCustomerId {
  const bookingsServer = getBookingsServer(aspects);
  return async (customerId: string): Promise<ListBookingsResponse> => {
    const request: ListBookingsRequest = {
      withBookingAllowedActions: false,
      query: {
        filter: `{"contactId": "${customerId}"}` as any,
        fieldsets: null, // TODO: is not used, only here because its mandatory in the proto
        fields: null, // TODO: is not used, only here because its mandatory in the proto
        sort: null,
      },
    };
    return makeLogged(bookingsServer.list)(request);
  };
}
export declare type GetterOfBookingsById = (
  bookingId: string,
) => Promise<ListBookingsResponse>;
export function getterOfBookingsByIdFactory(aspects): GetterOfBookingsById {
  const bookingsServer = getBookingsServer(aspects);
  return async (bookingId: string) => {
    const request: ListBookingsRequest = {
      withBookingAllowedActions: false,
      query: {
        filter: `{"bookingId" : "${bookingId}"}`,
        fieldsets: null,
        paging: null,
        fields: null,
        sort: null,
      },
    };
    return makeLogged(bookingsServer.list)(request);
  };
}
export declare type GetterOfBookingsByScheduleId = (
  scheduleId: string,
) => Promise<ListBookingsResponse>;
export function getterOfBookingsByScheduleIdFactory(
  aspects,
): GetterOfBookingsByScheduleId {
  const bookingsServer = getBookingsServer(aspects);
  return async (scheduleId: string) => {
    const request: ListBookingsRequest = {
      withBookingAllowedActions: false,
      query: {
        filter: `{"scheduleId" : "${scheduleId}"}`,
        fieldsets: null,
        paging: null,
        fields: null,
        sort: null,
      },
    };
    return makeLogged(bookingsServer.list)(request);
  };
}
export declare type GetterOfBookingsBySessionId = (
  sessionId: string,
) => Promise<ListBookingsResponse>;
export function getterOfBookingsBySessionIdFactory(
  aspects,
): GetterOfBookingsBySessionId {
  const bookingsServer = getBookingsServer(aspects);
  return async (sessionId: string) => {
    const request: ListBookingsRequest = {
      withBookingAllowedActions: false,
      query: {
        filter: `{"sessionId" : "${sessionId}"}`,
        fieldsets: null,
        paging: null,
        fields: null,
        sort: null,
      },
    };
    return makeLogged(bookingsServer.list)(request);
  };
}
export declare type UpdaterBookingAmountReceived = (
  amountReceived: number,
  bookingId: string,
) => Promise<UpdateBookingResponse>;
export function updaterBookingAmountReceivedFactory(
  aspects,
): UpdaterBookingAmountReceived {
  const bookingsServer = getBookingsServer(aspects);
  return async (amountReceived: number, bookingId: string) => {
    const updateBooking: UpdateBookingRequest = {
      id: bookingId,
      fieldMask: { paths: ['updateAmountReceived'] },
      updateAmountReceived: amountReceived.toString(),
      notifyParticipants: false,
    };
    return bookingsServer.update(updateBooking);
  };
}
export declare type GetterOfSessionById = (
  sessionId: string,
) => Promise<GetSessionResponse>;
export function getterOfSessionByIdFactory(aspects): GetterOfSessionById {
  const scheduleServer = getScheduleServer(aspects);
  return async (sessionId: string) => {
    return makeLogged(scheduleServer.getSession)({
      id: sessionId,
    });
  };
}
export declare type GetterOfScheduleById = (
  scheduleId: string,
) => Promise<GetScheduleResponse>;
export function getterOfScheduleByIdFactory(aspects): GetterOfScheduleById {
  const scheduleServer = getScheduleServer(aspects);
  return async (scheduleId: string) => {
    return makeLogged(scheduleServer.get)({
      id: scheduleId,
    });
  };
}

export function createBookFactory(aspects) {
  const bookingsServer = getBookingsServer(aspects);
  return async (bookReq: BookRequest) => {
    return makeLogged(bookingsServer.book)(bookReq);
  };
}

export declare type UpdaterOfBooking = (
  updateBookReq: UpdateBookingRequest,
) => Promise<UpdateBookingResponse>;
export function updateBookFactory(aspects): UpdaterOfBooking {
  const bookingsServer = getBookingsServer(aspects);
  return async (updateBookReq: UpdateBookingRequest) => {
    return makeLogged(bookingsServer.update)(updateBookReq);
  };
}
export declare type CancelerBook = (
  cancelRequest: CancelBookingRequest,
) => Promise<CancelBookingResponse>;
export function cancelBookFactory(aspects): CancelerBook {
  const bookingsServer = getBookingsServer(aspects);
  return async (cancelReq: CancelBookingRequest) => {
    return makeLogged(bookingsServer.cancel)(cancelReq);
  };
}

function getScheduleServer(aspects) {
  return ScheduleServer().Schedules()(aspects);
}

function getBookingsServer(aspects) {
  return BookingsServer().Bookings()(aspects);
}
