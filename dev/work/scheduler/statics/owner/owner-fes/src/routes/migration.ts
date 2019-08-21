import { wrapAsync } from './index';
import { updateBusinessInfo } from '../controllers/business-info';
import { createStaff, staffConverter } from '../controllers/staff';
import { offeringsConverter, getOfferingsList } from '../controllers/offerings';
import { updateBookingsForm } from '../controllers/bookings-form';

export function setMigrationRoutes(app, petri: any) {
  app.put(
    '/migration/business',
    wrapAsync((req, res) => updateBusinessInfo(req, res)),
  );
  app.post('/migration/staff', wrapAsync((req, res) => createStaff(req, res)));

  app.post(
    '/migration/converter/offerings',
    wrapAsync((req, res, next) => offeringsConverter(req, res, next, petri)),
  );
  app.get(
    '/migration/offerings',
    wrapAsync((req, res, next) => getOfferingsList(req, res, next)),
  );
  app.post(
    '/migration/converter/staff',
    wrapAsync((req, res, next) => staffConverter(req, res, next)),
  );

  app.put(
    '/migration/bookingsForm/',
    wrapAsync((req, res, next) => updateBookingsForm(req, res, next, petri)),
  );
}

export const ignoreMigrationRoutes = fn => (req, res, next) =>
  req.path.startsWith('/migration') ? next() : fn(req, res, next);
