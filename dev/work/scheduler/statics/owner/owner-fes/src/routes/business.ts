import { wrapAsync } from './index';
import {
  getBusinessInfo,
  getBusinessTimezone,
  getTras,
  updateBusinessInfo,
} from '../controllers/business-info';
import {
  getBusinessSetup,
  updateBusinessSetup,
} from '../controllers/business-setup';

export function setBusinessRoutes(app, config, petri) {
  app.get(
    '/owner/business',
    wrapAsync((req, res) => getBusinessInfo(req, res, config)),
  );
  app.put(
    '/owner/business',
    wrapAsync((req, res) => updateBusinessInfo(req, res)),
  );
  app.patch(
    '/owner/business/setup',
    wrapAsync((req, res) => updateBusinessSetup(req, res)),
  );
  app.get(
    '/owner/business/setup',
    wrapAsync((req, res) => getBusinessSetup(req, res)),
  );
  app.get(
    '/crm/business/timezone',
    wrapAsync((req, res) => getBusinessTimezone(req, res)),
  );
}
