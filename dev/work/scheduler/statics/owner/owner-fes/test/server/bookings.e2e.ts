import axios from 'axios';
import { Chance } from 'chance';
import {
  aParticipant,
  aSession,
} from '@wix/ambassador-calendar-server/builders';
import {
  ScheduleServer,
  GetScheduleRequest,
} from '@wix/ambassador-schedule-server/rpc';
import {
  aGetSessionResponse,
  aSchedule,
  aGetScheduleResponse,
} from '@wix/ambassador-schedule-server/builders';
import {
  ParticipantInSessionDto,
  ParticipantItemDto,
} from '../../src/dto/sessions/participant.dto';
import { ParticipantItemDtoBuilder } from '../builders/dto/participant-item.dto.builder';
import {
  BookingsServer,
  BookRequest,
  UpdateBookingRequest,
  FormInfo,
} from '@wix/ambassador-bookings-server/rpc';
import {
  aBooking,
  aBookResponse,
  aContactDetails,
  aFormInfo,
  aListBookingEntry,
  aListBookingsResponse,
} from '@wix/ambassador-bookings-server/builders';
import { OfferingTypes } from '../../src/dto/offerings/offerings.consts';
import {
  createABooking,
  withOnLinePayment,
} from '../builders/rpc-custom/booking-builder';

const chance = Chance();

function stubScheduleService(participants = []) {
  const scheduleServer = ambassadorServer.createStub(ScheduleServer);
  const session = aSession()
    .withParticipants(participants)
    .withTags([OfferingTypes.GROUP])
    .build();
  const response = aGetSessionResponse()
    .withSession(session)
    .build();
  scheduleServer
    .Schedules()
    .getSession.when(() => true)
    .resolve(response);
}

function stubGetParticipantsForCourse(expectedScheduleId, participants) {
  const oneParticipant = aParticipant().build();

  const session = aSession()
    .withTags([OfferingTypes.COURSE])
    .withScheduleId(expectedScheduleId)
    .build();

  const response = aGetSessionResponse()
    .withSession(session)
    .build();

  ambassadorServer
    .createStub(ScheduleServer)
    .Schedules()
    .getSession.when(() => true)
    .resolve(response);

  const schedule = aSchedule()
    .withId(expectedScheduleId)
    .withParticipants([oneParticipant])
    .build();

  ambassadorServer
    .createStub(ScheduleServer)
    .Schedules()
    .get.when((req: GetScheduleRequest) => req.id === expectedScheduleId)
    .resolve({ schedule });
}

function stubGetSession(
  returnedValue = aGetSessionResponse()
    .withSession(
      aSession()
        .withTags([])
        .build(),
    )
    .build(),
) {
  ambassadorServer
    .createStub(ScheduleServer)
    .Schedules()
    .getSession.when(() => true)
    .resolve(returnedValue);
}

function stubBookingsService(
  { bookingId = chance.guid() } = {},
  predicate = request => true,
) {
  const booking = aBooking()
    .withId(bookingId)
    .withFormInfo(
      aFormInfo()
        .withContactDetails(aContactDetails().build())
        .build(),
    )
    .build();
  const response = aBookResponse()
    .withBooking(booking)
    .build();

  ambassadorServer
    .createStub(BookingsServer)
    .Bookings()
    .book.when(predicate)
    .resolve(response);
}

function stubBookForCourse(bookingId, predicate, expectedScheduleId) {
  stubBookingsService({ bookingId }, predicate);
  const sessionResponse = aGetSessionResponse()
    .withSession(
      aSession()
        .withTags([OfferingTypes.COURSE])
        .withScheduleId(expectedScheduleId)
        .build(),
    )
    .build();
  stubGetSession(sessionResponse);
}

function stubGetSchedule() {
  ambassadorServer
    .createStub(ScheduleServer)
    .Schedules()
    .get.when(() => true)
    .resolve(
      aGetScheduleResponse()
        .withSchedule(
          aSchedule()
            .withTags([])
            .build(),
        )
        .build(),
    );
}

describe('Participants', () => {
  it('calls get participants for session', async () => {
    const sessionId: string = chance.guid();
    const participants = [aParticipant().build()];
    const booking = withOnLinePayment(createABooking()).build();
    const listBookingsResponse = aListBookingsResponse()
      .withBookingsEntries([
        aListBookingEntry()
          .withBooking(booking)
          .build(),
      ])
      .build();
    stubScheduleService(participants);
    ambassadorServer
      .createStub(BookingsServer)
      .Bookings()
      .list.when(() => true)
      .resolve(listBookingsResponse);
    const res = await axios(
      app.getUrl(`/owner/sessions/participants/${sessionId}`),
    );

    expect(res.status).toBe(200);
    expect(res.data.participants.length).toBe(participants.length);
  });

  it('calls get participants for course', async () => {
    const expectedScheduleId: string = chance.guid();
    const participants = [aParticipant().build()];
    stubGetParticipantsForCourse(expectedScheduleId, participants);
    stubBookingsService();
    const sessionId: string = chance.guid();

    const res = await axios(
      app.getUrl(`/owner/sessions/participants/${sessionId}`),
    );

    expect(res.status).toBe(200);
    expect(res.data.participants.length).toBe(participants.length);
  });

  it('calls add participants to session', async () => {
    const responseBookingId: string = chance.guid();
    stubBookingsService({ bookingId: responseBookingId });
    stubGetSession();
    stubGetSchedule();
    const sessionId: string = chance.guid();
    const participant: ParticipantItemDto = new ParticipantItemDtoBuilder().build();
    const addParticipantReq: ParticipantInSessionDto = {
      participant,
      registrationType: 'SINGLE_SESSION',
      sendEmail: true,
    };

    const res = await axios.post(
      app.getUrl(`/owner/sessions/${sessionId}/participant`),
      addParticipantReq,
    );

    expect(res.status).toBe(200);
    expect(res.data.bookingId).toBe(responseBookingId);
  });

  it('calls add participants to course', async () => {
    const responseBookingId: string = chance.guid();
    const expectedScheduleId = chance.guid();
    const predicate = (request: BookRequest) => {
      return (
        request.scheduleId === expectedScheduleId && request.sessionId === null
      );
    };

    stubBookForCourse(responseBookingId, predicate, expectedScheduleId);
    const sessionId: string = chance.guid();
    const participant: ParticipantItemDto = new ParticipantItemDtoBuilder().build();
    const addParticipantReq: ParticipantInSessionDto = {
      participant,
      registrationType: 'SINGLE_SESSION',
      sendEmail: true,
    };

    const res = await axios.post(
      app.getUrl(`/owner/sessions/${sessionId}/participant`),
      addParticipantReq,
    );

    expect(res.status).toBe(200);
    expect(res.data.bookingId).toBe(responseBookingId);
  });

  it('calls remove participant from session', async () => {
    const bookingId = chance.guid();
    const sessionId: string = chance.guid();
    const onDelete = jest.fn();

    ambassadorServer
      .createStub(BookingsServer)
      .Bookings()
      .cancel.when(() => true)
      .call(onDelete);

    const res = await axios.delete(
      app.getUrl(`/owner/sessions/${sessionId}/participant/${bookingId}`),
    );

    expect(res.status).toBe(200);
    expect(onDelete).toHaveBeenCalled();
  });

  it('calls edit participant on class session', async () => {
    const bookingId = chance.guid();
    const sessionId: string = chance.guid();
    const onUpdate = jest.fn();
    let receivedParticipant: FormInfo;
    const firstName = chance.first();
    const lastName = chance.last();
    const fullName = `${firstName} ${lastName}`;

    const updatedParticipant = {
      participantId: {
        contactId: chance.guid(),
        email: chance.email(),
      },
      editedParticipant: {
        fullName,
        phone: chance.phone(),
        numberOfParticipants: chance.integer({ min: 0, max: 20 }),
      },
      registrationType: 'SINGLE_SESSION',
    };

    ambassadorServer
      .createStub(BookingsServer)
      .Bookings()
      .update.when((updateBookRequest: UpdateBookingRequest) => {
        receivedParticipant = updateBookRequest.formInfo;
        return true;
      })
      .call(onUpdate);

    const res = await axios.put(
      app.getUrl(`/owner/sessions/${sessionId}/participant/${bookingId}`),
      updatedParticipant,
    );

    expect(res.status).toBe(200);
    expect(onUpdate).toHaveBeenCalled();
    expect(receivedParticipant.paymentSelection[0].numberOfParticipants).toBe(
      updatedParticipant.editedParticipant.numberOfParticipants,
    );
    expect(receivedParticipant.paymentSelection[0].rateLabel).toBeUndefined();
    expect(receivedParticipant.contactDetails.firstName).toBe(firstName);
    expect(receivedParticipant.contactDetails.lastName).toBe(lastName);
  });
});
