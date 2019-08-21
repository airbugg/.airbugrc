import { wrapAsync } from './index';
import {
  getBookingsForm,
  updateBookingsForm,
} from '../controllers/bookings-form';

export function setBookingsForm(app: any, config: any, petri: any) {
  app.get(
    '/owner/bookingsForm/',
    wrapAsync((req, res, next) => getBookingsForm(req, res, next, petri)),
  );
  app.put(
    '/owner/bookingsForm/',
    wrapAsync((req, res, next) => updateBookingsForm(req, res, next, petri)),
  );
}
