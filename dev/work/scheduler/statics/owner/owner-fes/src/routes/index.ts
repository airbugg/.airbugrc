import { setConfigRoutes } from './owner-config';
import { setStaffRoutes } from './staff';
import { setOfferingsRoutes } from './offerings';
import { setBookingsRoutes } from './bookings';
import { setCalendarRoutes } from './calendar';
import { setBusinessRoutes } from './business';
import { setBookingsForm } from './bookings-form';
import { setCRMRoutes } from './crm';
import { setCouponsRoutes } from './coupons';
import { setNotificationRoutes } from './email';
import { setBenefitRoutes } from './benefit-routes';
import { setCategoriesRoutes } from './categories';
import { setADIRoutes } from './adi';
import { setVMRoutes } from './vm';
import { setMigrationRoutes } from './migration';
//import { setSessionPageRoutes } from './session-page';

export function setServerRoutes(
  app,
  config,
  petri,
  gatekeeprClient,
  apiGwClient,
) {
  setConfigRoutes(app, config, petri);
  setBusinessRoutes(app, config, petri);
  setStaffRoutes(app, petri, gatekeeprClient, apiGwClient);
  setOfferingsRoutes(app, petri);
  setCategoriesRoutes(app);
  setBookingsRoutes(app, petri);
  setCalendarRoutes(app);
  setBookingsForm(app, config, petri);
  setCouponsRoutes(app);
  setCRMRoutes(app, apiGwClient, petri);
  setNotificationRoutes(app);
  setBenefitRoutes(app);
  setADIRoutes(app);
  setVMRoutes(app, config);
  setMigrationRoutes(app, petri);
  //setSessionPageRoutes(app);
  return app;
}

export function wrapAsync(asyncFn) {
  return (req, res, next) => asyncFn(req, res, next).catch(next);
}
