import axios from 'axios';
import { createAnAppointment } from '../builders/dto/appointment.dto.builder';
import {
  BookingsServer,
  CancelBookingRequest,
  ListBookingsRequest,
} from '@wix/ambassador-bookings-server/rpc';
import {
  aListResourcesResponse,
  aResource,
  aSchedule,
} from '@wix/ambassador-resources-server/builders';
import { ResourcesServer } from '@wix/ambassador-resources-server/rpc';
import { ServicesCatalogServer } from '@wix/ambassador-services-catalog-server/rpc';
import {
  aBookedEntity,
  aBooking,
  aCancelBookingResponse,
  aListBookingEntry,
  anUpdateBookingResponse,
} from '@wix/ambassador-bookings-server/builders';
import {
  aGetServiceResponse,
  aService,
} from '@wix/ambassador-services-catalog-server/builders';
import { Chance } from 'chance';
import { aLocation } from '@wix/ambassador-services-server/builders';
import { LocationType } from '@wix/ambassador-services-server/types';

const chance = new Chance();

function bookingsServerStub() {
  return ambassadorServer.createStub(BookingsServer);
}

function servicesCatalogServerStub() {
  return ambassadorServer.createStub(ServicesCatalogServer);
}

describe('appointments', () => {
  it('should create an appointment', async () => {
    const staffId = 'staffId';

    const appointment = createAnAppointment(staffId);

    const scheduleId = chance.guid();

    const bookingRes = aBooking().build();
    const service = aService()
      .withScheduleIds([scheduleId])
      .build();

    servicesCatalogServerStub()
      .ServicesCatalog()
      .get.when({ id: appointment.serviceId, fields: null })
      .resolve(
        aGetServiceResponse()
          .withService(service)
          .withSchedules([
            aSchedule()
              .withLocation(
                aLocation()
                  .withLocationType(LocationType.OWNER_BUSINESS)
                  .build(),
              )
              .build(),
          ])
          .build(),
      );

    bookingsServerStub()
      .Bookings()
      .book.when(bookRequest => {
        if (bookRequest.createSession.scheduleId === scheduleId) {
          return true;
        }
        return false;
      })
      .resolve({ booking: bookingRes });

    const resourceServer = ambassadorServer.createStub(ResourcesServer);
    const response = aListResourcesResponse()
      .withResources([
        aResource()
          .withId(staffId)
          .withSchedules([
            aSchedule()
              .withId('scheduleId')
              .build(),
          ])
          .build(),
      ])
      .build();

    resourceServer
      .ResourcesService()
      .list.when(() => true)
      .resolve(response);

    const res = await axios.post(
      app.getUrl('/owner/appointments'),
      appointment,
    );
    expect(res.data.booking).toEqual(bookingRes);
  });

  it('should update an appointment', async () => {
    const staffId = 'staffId';

    const appointment = createAnAppointment(staffId);

    const scheduleId = chance.guid();

    const bookingRes = aBooking()
      .withBookedEntity(aBookedEntity().build())
      .build();
    const service = aService()
      .withScheduleIds([scheduleId])
      .build();

    servicesCatalogServerStub()
      .ServicesCatalog()
      .get.when({ id: appointment.serviceId, fields: null })
      .resolve(
        aGetServiceResponse()
          .withService(service)
          .withSchedules([
            aSchedule()
              .withLocation(
                aLocation()
                  .withLocationType(LocationType.OWNER_BUSINESS)
                  .build(),
              )
              .build(),
          ])
          .build(),
      );

    bookingsServerStub()
      .Bookings()
      .list.when(() => true)
      .resolve({
        bookingsEntries: [
          aListBookingEntry()
            .withBooking(bookingRes)
            .build(),
        ],
      });

    bookingsServerStub()
      .Bookings()
      .update.when(() => true)
      .resolve(anUpdateBookingResponse().build());

    const resourceServer = ambassadorServer.createStub(ResourcesServer);
    const response = aListResourcesResponse()
      .withResources([
        aResource()
          .withId(staffId)
          .withSchedules([
            aSchedule()
              .withId('scheduleId')
              .build(),
          ])
          .build(),
      ])
      .build();

    resourceServer
      .ResourcesService()
      .list.when(() => true)
      .resolve(response);

    const res = await axios.put(app.getUrl('/owner/appointments'), appointment);
    expect(res.data).toBeDefined();
  });

  it('should delete an appointment', async () => {
    const sessionId: string = chance.guid();
    const serviceId: string = chance.guid();

    const bookingRes = aBooking().build();

    bookingsServerStub()
      .Bookings()
      .list.when((listBookingsRequest: ListBookingsRequest) => {
        if (listBookingsRequest.query.filter.toString().includes(sessionId)) {
          return true;
        }
        return false;
      })
      .resolve({
        bookingsEntries: [
          aListBookingEntry()
            .withBooking(bookingRes)
            .build(),
        ],
      });
    bookingsServerStub()
      .Bookings()
      .cancel.when((cancelBookingRequest: CancelBookingRequest): boolean => {
        if (cancelBookingRequest.id === bookingRes.id) {
          return true;
        }
        return false;
      })
      .resolve(aCancelBookingResponse().build());

    const res = await axios.delete(
      app.getUrl(`/owner/appointments/${sessionId}/${serviceId}`),
    );
    expect(res.data).toBeDefined();
  });
});
