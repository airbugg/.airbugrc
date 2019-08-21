import { mapBookingToCustomerBooking } from '../mappers/bookings/bookings-to-customer-booking';
import {
  ListBookingEntry,
  ListBookingsResponse,
  PaymentDetails,
} from '@wix/ambassador-bookings-server';
import {
  GetServiceResponse,
  ListServicesResponse,
} from '@wix/ambassador-services-catalog-server/rpc';
import { CustomerBookingDTO } from '../../dto/booking/customer-booking.dto';
import { CustomerDto } from '../../dto/customer.dto';
import {
  AddressDto,
  DomainContactName,
  DomainPhone,
  WixInternalContactDto,
  WixInternalContactsResponse,
} from '@wix/ambassador-wix-contacts-webapp';
import {
  GetterOfBookingsByCustomerId,
  GetterOfBookingsById,
  UpdaterBookingAmountReceived,
} from '../bookings/bookings-adapter-rpc';
import { GetterOfferingsList } from '../offerings/services-catalog-rpc';

function findServiceById(
  serviceId: string,
  listServicesResponse: ListServicesResponse,
) {
  return listServicesResponse.services.find(
    (getServiceResponse: GetServiceResponse) => {
      return getServiceResponse.service.id === serviceId;
    },
  );
}

export async function getBookings(
  contactId: string,
  getterOfBookingsByContactById: GetterOfBookingsByCustomerId,
  getterOfferingsList: GetterOfferingsList,
  experiments,
) {
  const [listBookingsResponse, listServicesResponse] = await Promise.all([
    getterOfBookingsByContactById(contactId),
    getterOfferingsList(true),
  ]);
  const listBookings: ListBookingsResponse = listBookingsResponse;
  let customerBooking: CustomerBookingDTO[] = [];
  if (listBookings.bookingsEntries) {
    customerBooking = listBookings.bookingsEntries.map(
      (listBookingEntry: ListBookingEntry) => {
        const getServiceResponse: GetServiceResponse = findServiceById(
          listBookingEntry.booking.bookedEntity.serviceId,
          listServicesResponse,
        );
        return mapBookingToCustomerBooking(
          listBookingEntry.booking,
          getServiceResponse.service,
          listBookingEntry.booking.bookedResources[0],
          experiments,
        );
      },
    );
  }
  return customerBooking.sort((a, b) => b.start - a.start);
}

export async function markedBookingAsFullyPaid(
  bookingId: string,
  amount: number,
  getterOfBooking: GetterOfBookingsById,
  updaterAmountReceived: UpdaterBookingAmountReceived,
) {
  const existingBookingsResponse = await getterOfBooking(bookingId);
  const booking = existingBookingsResponse.bookingsEntries[0];
  const amountReceived = getMarkedAsPaidAmount(booking.booking.paymentDetails);
  const res = await updaterAmountReceived(amountReceived, bookingId);
  return res;
}

function getMarkedAsPaidAmount(paymentDetails: PaymentDetails): number {
  return parseFloat(paymentDetails.balance.finalPrice.amount);
}

export async function unMarkedBookingAsFullyPaid(
  bookingId: string,
  getterOfBooking: GetterOfBookingsById,
  updaterAmountReceived: UpdaterBookingAmountReceived,
) {
  const existingBookingsResponse = await getterOfBooking(bookingId);
  const booking = existingBookingsResponse.bookingsEntries[0];
  const amountReceived = getUnMarkedAsPaidAmount(
    booking.booking.paymentDetails,
  );
  const res = await updaterAmountReceived(amountReceived, bookingId);
  return res;
}

function getUnMarkedAsPaidAmount(paymentDetails: PaymentDetails): number {
  return paymentDetails.wixPayDetails &&
    paymentDetails.wixPayDetails.orderAmount &&
    paymentDetails.wixPayDetails.paymentVendorName !== 'inPerson'
    ? parseFloat(paymentDetails.wixPayDetails.orderAmount)
    : 0;
}

export async function searchForCustomers(
  searcherOfContacts: () => Promise<WixInternalContactsResponse>,
): Promise<CustomerDto[]> {
  const queryResponse = await searcherOfContacts();

  return queryResponse.items.map(WixInterContactDtoToCustomer);
}

function WixInterContactDtoToCustomer(
  wixInternalContact: WixInternalContactDto,
): CustomerDto {
  const firstAddress = extractPrimaryAddress(wixInternalContact);
  return {
    id: wixInternalContact.id,
    email: extractEmail(wixInternalContact),
    phone: extractPrimaryPhone(wixInternalContact),
    address: {
      city: firstAddress.city || '',
      street: firstAddress.address || '',
      zipCode: firstAddress.postalCode || '',
    },
    firstName: DomainContactNameToFirstName(wixInternalContact.name),
    lastName: DomainContactNameToLastName(wixInternalContact.name),
    birthday: null,
    note: null,
    additionalFields: [],
  };
}

function extractEmail(contactDto: WixInternalContactDto) {
  if (
    !contactDto.emails ||
    !contactDto.emails.length ||
    !contactDto.emails[0] ||
    !contactDto.emails[0].email
  ) {
    return '';
  }
  return contactDto.emails[0].email.toLowerCase();
}

function extractPrimaryPhone(contactDto: WixInternalContactDto): string {
  if (!contactDto.phones || !contactDto.phones.length) {
    return '';
  }
  const phoneDto: DomainPhone = contactDto.phones.find(p => p.id === 1);
  return phoneDto.phone ? phoneDto.phone : '';
}

function extractPrimaryAddress(contactDto: WixInternalContactDto): AddressDto {
  const emptyAddress: AddressDto = {
    city: '',
    address: '',
    postalCode: '',
    id: 1,
    tag: null,
  };

  if (!contactDto.addresses || !contactDto.addresses.length) {
    return emptyAddress;
  }

  return contactDto.addresses.find(a => a.id === 1) || emptyAddress;
}

function DomainContactNameToFirstName(name: DomainContactName): string {
  return name
    ? [name.prefix, name.first, name.middle].filter(n => !!n).join(' ')
    : '';
}

function DomainContactNameToLastName(name: DomainContactName): string {
  return name ? [name.last, name.suffix].filter(n => !!n).join(' ') : '';
}

// export interface DomainContactName {
//   prefix?: String;
//   suffix?: String;
//   last?: String;
//   middle?: String;
//   first?: String;
// }

// function mapV3ContactToCustomer(v3Contact: V3Contact) {
//   const firstAddress: V3Address = getItemIfExists(v3Contact.addresses);
//   const city = firstAddress && firstAddress.city ? firstAddress.city : '';
//   const street = firstAddress && firstAddress.street ? firstAddress.street : '';
//   const zipCode =
//     firstAddress && firstAddress.postalCode ? firstAddress.postalCode : '';
//   return {
//     id: v3Contact.id,
//     firstName: v3Contact.firstName || '',
//     lastName: v3Contact.lastName || '',
//     phone: getItemIfExists(v3Contact.phones) || '',
//     email: getItemIfExists(v3Contact.emails) || '',
//     address: {
//       city,
//       street,
//       zipCode,
//     },
//     birthday: null,
//     note: null,
//     additionalFields: [],
//   };
// }
