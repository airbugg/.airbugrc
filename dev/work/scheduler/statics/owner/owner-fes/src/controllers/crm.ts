import {
  getterOfBookingsByCustomerIdFactory,
  getterOfBookingsByIdFactory,
  updaterBookingAmountReceivedFactory,
} from '../adapters/bookings/bookings-adapter-rpc';
import {
  getBookings,
  markedBookingAsFullyPaid,
  searchForCustomers,
  unMarkedBookingAsFullyPaid,
} from '../adapters/crm/crm-adapter';
import { getterOfferingsListFactory } from '../adapters/offerings/services-catalog-rpc';
import { CustomerDto } from '../dto/customer.dto';
import { searchContactsFactory } from '../adapters/crm/contacts-adapter.rpc';
import { conductAllScopesFactory } from '../adapters/petri/conduct-all-scopes';

export async function getCustomerBookings(req, res, next, petri) {
  try {
    const experiments = await conductAllScopesFactory(req.aspects, petri)();
    const customerId = req.params.customerId;
    const bookingsList = await getBookings(
      customerId,
      getterOfBookingsByCustomerIdFactory(req.aspects),
      getterOfferingsListFactory(req.aspects),
      experiments,
    );
    res.send({ bookings: bookingsList });
  } catch (e) {
    console.log('e', e);
    next(e);
  }
}
export async function markedBookingAsPaid(req, res, next) {
  const bookingId = req.params.bookingId;
  const amount = parseFloat(req.body.amount);
  const response = await markedBookingAsFullyPaid(
    bookingId,
    amount,
    getterOfBookingsByIdFactory(req.aspects),
    updaterBookingAmountReceivedFactory(req.aspects),
  );
  res.send({ bookings: response });
}

export async function unMarkedBookingAsPaid(req, res) {
  const bookingId = req.params.bookingId;
  const response = await unMarkedBookingAsFullyPaid(
    bookingId,
    getterOfBookingsByIdFactory(req.aspects),
    updaterBookingAmountReceivedFactory(req.aspects),
  );
  res.send({ bookings: response });
}

export async function searchCustomers(req, res, next, apiGwClient) {
  const searchText = req.query.searchText;
  const pageSize = req.query.pageSize ? parseInt(req.query.pageSize, 10) : 25;
  const metaSiteId: string = await apiGwClient.metaSiteId(req.aspects);
  const customers: CustomerDto[] = await searchForCustomers(
    searchContactsFactory(metaSiteId, searchText, pageSize, req.aspects),
  );
  res.send({ customers });
}
