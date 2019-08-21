import {
  getBookings,
  markedBookingAsFullyPaid,
  searchForCustomers,
  unMarkedBookingAsFullyPaid,
} from './crm-adapter';
import { Chance } from 'chance';
import {
  Booking,
  ListBookingEntry,
  ListBookingsResponse,
} from '@wix/ambassador-bookings-server';
import {
  createABooking,
  withOnLinePayment,
} from '../../../test/builders/rpc-custom/booking-builder';
import { WixInternalContactsResponse } from '@wix/ambassador-wix-contacts-webapp';
import { CustomerDto } from '../../dto/customer.dto';
import {
  aDomainContactName,
  aDomainEmail,
  aPhoneDto,
  aWixInternalContactDto,
  aWixInternalContactsResponse,
} from '@wix/ambassador-wix-contacts-webapp/builders';
import {
  aListBookingEntry,
  aListBookingsResponse,
  anUpdateBookingResponse,
} from '@wix/ambassador-bookings-server/builders';
import {
  aGetServiceResponse,
  aService,
} from '@wix/ambassador-services-server/builders';
import {
  aListServicesResponse,
  aServiceInfo,
} from '@wix/ambassador-services-catalog-server/builders';

const chance = new Chance();
describe('get customer bookings list', () => {
  function createAListOfBookings(): ListBookingsResponse {
    const priceAmount = chance
      .floating({ min: 0, max: 100, fixed: 2 })
      .toString();
    const serviceId = chance.guid();
    const booking: Booking = withOnLinePayment(
      createABooking(priceAmount, serviceId),
      priceAmount,
    ).build();
    //booking.paymentDetails.
    return aListBookingsResponse()
      .withBookingsEntries([
        aListBookingEntry()
          .withBooking(booking)
          .build(),
      ])
      .build();
  }

  function createServicesFromBookings(bookingsList: ListBookingsResponse) {
    let list = [];
    if (bookingsList.bookingsEntries) {
      list = bookingsList.bookingsEntries.map(
        (listBooking: ListBookingEntry) => {
          const service = aService()
            .withId(listBooking.booking.bookedEntity.serviceId)
            .withInfo(
              aServiceInfo()
                .withName(chance.string())
                .build(),
            )
            .build();
          return aGetServiceResponse()
            .withService(service)
            .build();
        },
      );
    }
    const serviceResponse = aListServicesResponse()
      .withServices(list)
      .build();
    return serviceResponse;
  }

  it('should return list of customer bookings', async () => {
    const customerId = chance.guid();
    const bookingsList = createAListOfBookings();
    const getServiceListResponse = createServicesFromBookings(bookingsList);
    const experiments = {};
    const bookings = await getBookings(
      customerId,
      async () => bookingsList,
      async () => getServiceListResponse,
      experiments,
    );
    expect(bookings.length).toBe(1);
  });

  it('should return empty list', async () => {
    const customerId = chance.guid();
    const bookingsList = aListBookingsResponse()
      .withBookingsEntries(null)
      .build();
    const getServiceListResponse = createServicesFromBookings(bookingsList);
    const experiments = {};
    const bookings = await getBookings(
      customerId,
      async () => bookingsList,
      async () => getServiceListResponse,
      experiments,
    );
    expect(bookings.length).toBe(0);
  });
});

describe('update balance of booking', () => {
  it('should marked bookings as fully paid', async () => {
    //const bookingId:string = chance.guid();
    const priceAmount = chance
      .floating({ min: 0, max: 100, fixed: 2 })
      .toString();

    const serviceId = chance.guid();
    const booking: Booking = withOnLinePayment(
      createABooking(priceAmount, serviceId),
      priceAmount,
    ).build();
    let amountForUpdate;
    const updater = async (amountReceived: number, id: string) => {
      amountForUpdate = amountReceived;
      return anUpdateBookingResponse().build();
    };
    const res = await markedBookingAsFullyPaid(
      booking.id,
      20,
      async (id: string) =>
        aListBookingsResponse()
          .withBookingsEntries([
            aListBookingEntry()
              .withBooking(booking)
              .build(),
          ])
          .build(),
      updater,
    );
    expect(amountForUpdate.toString()).toBe(
      booking.paymentDetails.balance.finalPrice.amount,
    );
  });

  it('should un marked booking as fully paid', async () => {
    //const bookingId:string = chance.guid();
    const priceAmount = '50.4';
    const serviceId = chance.guid();
    const booking: Booking = withOnLinePayment(
      createABooking(priceAmount, serviceId),
      priceAmount,
    ).build();
    booking.paymentDetails.balance.amountReceived = priceAmount;
    booking.paymentDetails.wixPayDetails.orderAmount = (
      parseFloat(priceAmount) - 10
    ).toString();
    let amountForUpdate;
    const updater = async (amountReceived: number, id: string) => {
      amountForUpdate = amountReceived;
      return anUpdateBookingResponse().build();
    };
    const res = await unMarkedBookingAsFullyPaid(
      booking.id,
      async (id: string) =>
        aListBookingsResponse()
          .withBookingsEntries([
            aListBookingEntry()
              .withBooking(booking)
              .build(),
          ])
          .build(),
      updater,
    );
    expect(amountForUpdate.toString()).toBe(
      booking.paymentDetails.wixPayDetails.orderAmount,
    );
  });
});

describe('search customers', () => {
  it('should search for contacts', async () => {
    const firstName = chance.first();
    const lastName = chance.last();
    const contactId = chance.guid();
    const phone = chance.phone();
    const email = chance.email();
    const street = chance.street();
    const city = chance.city();
    const zipCode = chance.zip();
    const customerList: WixInternalContactsResponse = aWixInternalContactsResponse()
      .withItems([
        aWixInternalContactDto()
          .withName(
            aDomainContactName()
              .withPrefix(null)
              .withFirst(firstName)
              .withLast(lastName)
              .withMiddle(null)
              .withSuffix(null)
              .build(),
          )
          .withId(contactId)
          .withEmails([
            aDomainEmail()
              .withEmail(email)
              .build(),
          ])
          .withPhones([
            aPhoneDto()
              .withPhone(phone)
              .withId(1)
              .build(),
          ])
          .withAddresses([
            {
              city,
              address: street,
              postalCode: zipCode,
              tag: null,
              id: 1,
            },
          ])
          .build(),
      ])
      .build();

    const res: CustomerDto[] = await searchForCustomers(
      async () => customerList,
    );

    expect(res[0].id).toEqual(contactId);
    expect(res[0].firstName).toEqual(firstName);
    expect(res[0].lastName).toEqual(lastName);
    expect(res[0].phone).toEqual(phone);
    expect(res[0].email).toEqual(email);
    expect(res[0].address).toEqual({ city, street, zipCode });
  });

  it('should return empty fields as empty strings', async () => {
    const firstName = chance.first();
    const lastName = null;
    const contactId = chance.guid();
    const phone = null;
    const email = null;
    const street = null;
    const city = null;
    const zipCode = null;
    const customerList: WixInternalContactsResponse = aWixInternalContactsResponse()
      .withItems([
        aWixInternalContactDto()
          .withName(
            aDomainContactName()
              .withSuffix(null)
              .withFirst(firstName)
              .withLast(lastName)
              .withMiddle(null)
              .withPrefix(null)
              .build(),
          )
          .withId(contactId)
          .withEmails(null)
          .withPhones(null)
          .withAddresses([
            {
              city,
              address: street,
              postalCode: zipCode,
              tag: null,
              id: 1,
            },
          ])
          .build(),
      ])
      .build();
    const res: CustomerDto[] = await searchForCustomers(
      async () => customerList,
    );

    expect(res[0].id).toEqual(contactId);
    expect(res[0].firstName).toContain(firstName);
    expect(res[0].lastName).toEqual('');
    expect(res[0].phone).toEqual('');
    expect(res[0].email).toEqual('');
    expect(res[0].address).toEqual({ city: '', street: '', zipCode: '' });
  });
});

// it('should search for contacts', async () => {
//   const firstName = chance.first();
//   const lastName = chance.last();
//   const contactId = chance.guid();
//   const phone = chance.phone();
//   const email = chance.email();
//   const street = chance.street();
//   const city = chance.city();
//   const zipCode = chance.zip();
//   const customerList: V3QueryContactsResponse = aV3QueryContactsResponse()
//     .withContacts([
//       aV3Contact()
//         .withFirstName(firstName)
//         .withLastName(lastName)
//         .withId(contactId)
//         .withEmails([email])
//         .withPhones([phone])
//         .withAddresses([
//           {
//             city,
//             street,
//             postalCode: zipCode,
//           },
//         ])
//         .build(),
//     ])
//     .build();
//
//   const res: CustomerDto[] = await searchForCustomers(
//     firstName,
//     async () => customerList,
//   );
//
//   expect(res[0].id).toEqual(contactId);
//   expect(res[0].firstName).toEqual(firstName);
//   expect(res[0].lastName).toEqual(lastName);
//   expect(res[0].phone).toEqual(phone);
//   expect(res[0].email).toEqual(email);
//   expect(res[0].address).toEqual({ city, street, zipCode });
// });
//
// it('should return empty fields as empty strings', async () => {
//   const firstName = chance.first();
//   const lastName = null;
//   const contactId = chance.guid();
//   const phone = null;
//   const email = null;
//   const street = null;
//   const city = null;
//   const zipCode = null;
//   const customerList: V3QueryContactsResponse = aV3QueryContactsResponse()
//     .withContacts([
//       aV3Contact()
//         .withFirstName(firstName)
//         .withLastName(lastName)
//         .withId(contactId)
//         .withEmails([email])
//         .withPhones([phone])
//         .withAddresses([
//           {
//             city,
//             street,
//             postalCode: zipCode,
//           },
//         ])
//         .build(),
//     ])
//     .build();
//
//   const res: CustomerDto[] = await searchForCustomers(
//     firstName,
//     async () => customerList,
//   );
//
//   expect(res[0].id).toEqual(contactId);
//   expect(res[0].firstName).toEqual(firstName);
//   expect(res[0].lastName).toEqual('');
//   expect(res[0].phone).toEqual('');
//   expect(res[0].email).toEqual('');
//   expect(res[0].address).toEqual({ city: '', street: '', zipCode: '' });
// });
// });

// export interface CustomerDto {
//   id: string;
//   firstName: string;
//   lastName: string;
//   phone: string;
//   email: string;
//   address: {
//     city: string;
//     street: string;
//     zipCode: string;
//   };
//   birthday: null;
//   note: null;
//   additionalFields: any[];
// }
