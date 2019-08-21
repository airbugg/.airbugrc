import axios from 'axios';
import { Chance } from 'chance';
import { createInstanceFrom } from './util/instance-generator';
import {
  Booking,
  BookingsServer,
  ListBookingsResponse,
  UpdateBookingResponse,
} from '@wix/ambassador-bookings-server/rpc';
import {
  createABooking,
  withOnLinePayment,
} from '../builders/rpc-custom/booking-builder';
import { aListBookingEntry } from '@wix/ambassador-bookings-server/builders';
import {
  aGetServiceResponse,
  aListServicesResponse,
} from '@wix/ambassador-services-catalog-server/builders';
import { ServicesCatalogServer } from '@wix/ambassador-services-catalog-server/rpc';
import { createAService } from '../builders/rpc-custom/service';

const chance = Chance();
let axiosInstance;
const instanceId = chance.guid();
describe('CRM Bookings', () => {
  function mockUpdateBookings() {
    const booking: Booking = withOnLinePayment(createABooking()).build();
    const updateBookingResponse: UpdateBookingResponse = {
      booking,
    };
    ambassadorServer
      .createStub(BookingsServer)
      .Bookings()
      .update.when(() => true)
      .resolve(updateBookingResponse);
  }

  function mockListBookings(serviceId: string = chance.guid()) {
    const booking: Booking = withOnLinePayment(createABooking()).build();
    booking.bookedEntity.serviceId = serviceId;
    const listBookings = aListBookingEntry()
      .withBooking(booking)
      .build();
    const listBookingResponse: ListBookingsResponse = {
      bookingsEntries: [listBookings],
    };

    ambassadorServer
      .createStub(BookingsServer)
      .Bookings()
      .list.when(() => true)
      .resolve(listBookingResponse);
  }

  beforeEach(() => {
    axiosInstance = axios.create({
      headers: {
        Authorization: createInstanceFrom({
          instanceId,
        }),
      },
    });
  });

  it('should get bookings per contact', async () => {
    const service = createAService().build();

    const response = aListServicesResponse()
      .withServices([
        aGetServiceResponse()
          .withService(service)
          .build(),
      ])
      .build();

    ambassadorServer
      .createStub(ServicesCatalogServer)
      .ServicesCatalog()
      .list.when(() => true)
      .resolve(response);
    const customerId = chance.guid();
    mockListBookings(service.id);
    const bookingsResponse = await axios.get(
      app.getUrl(`/crm/customers/${customerId}/bookings`),
    );
    expect(bookingsResponse.data.bookings).toBeDefined();
  });

  it('should mark as plan', async () => {
    mockUpdateBookings();
    mockListBookings();

    const bookingId = chance.guid();
    const amount = chance.guid();
    const customerId: string = chance.guid();
    const response = await axios.post(
      app.getUrl(
        `/crm/customers/${customerId}/bookings/${bookingId}/offlinePayments`,
      ),
      { amount },
    );
    expect(response.data).toBeDefined();
  });

  it('should un mark as plan', async () => {
    mockUpdateBookings();
    mockListBookings();
    const bookingId = chance.guid();
    const customerId: string = chance.guid();
    const paymentId: string = chance.guid();
    const response = await axios.delete(
      app.getUrl(
        `/crm/customers/${customerId}/bookings/${bookingId}/offlinePayments/${paymentId}`,
      ),
    );
    expect(response.data).toBeDefined();
  });

  // it('should search Contacts', async () => {
  //   //TODO add testkit for this test to work
  //   const firstName = chance.first();
  //   const lastName = chance.last();
  //   const id = chance.guid();
  //   ambassadorServer
  //     .createStub(WixContactsWebapp)
  //     .WixInternalContactsFacade()
  //     .getContacts.when(() => true)
  //     .resolve(
  //       aWixInternalContactsResponse()
  //         .WithItems([
  //           aWixInternalContactDto()
  //             .withFirstName(firstName)
  //             .withLastName(lastName)
  //             .withId(id)
  //             .build(),
  //         ])
  //         .Build(),
  //     );
  //   const expectedCustomer: CustomerDto = new CustomerDtoBuilder()
  //     .withFirstName(firstName)
  //     .withLastName(lastName)
  //     .withId(id)
  //     .build();
  //
  //   const response = await axios.get(
  //     app.getUrl(`/crm/customers/search?searchText=${firstName}&pageSize=5`),
  //   );
  //
  //   expect(response.data).toEqual({ customers: [expectedCustomer] });
  // });
});
