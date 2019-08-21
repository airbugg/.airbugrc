import { wrapAsync } from './index';
import {
  getCustomerBookings,
  markedBookingAsPaid,
  searchCustomers,
  unMarkedBookingAsPaid,
} from '../controllers/crm';

export function setCRMRoutes(app, apiGwClient, petri) {
  app.get(
    '/crm/customers/:customerId/bookings',
    wrapAsync((req, res, next) => getCustomerBookings(req, res, next, petri)),
  );
  app.post(
    `/crm/customers/:contactId/bookings/:bookingId/offlinePayments`,
    wrapAsync((req, res, next) => markedBookingAsPaid(req, res, next)),
  );
  app.delete(
    `/crm/customers/:contactId/bookings/:bookingId/offlinePayments/:paymentId`,
    wrapAsync((req, res) => unMarkedBookingAsPaid(req, res)),
  );
  app.get(
    '/crm/customers/search',
    wrapAsync((req, res, next) => searchCustomers(req, res, next, apiGwClient)),
  );
}
