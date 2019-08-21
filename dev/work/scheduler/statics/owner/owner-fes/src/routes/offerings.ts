import { wrapAsync } from './index';
import {
  getOfferingsList,
  createOffering,
  updateOfferingListOrder,
  getOffering,
  updateOffering,
  deleteOffering,
  bulkCreateOfferings,
} from '../controllers/offerings';

export function setOfferingsRoutes(app, petri) {
  app.get(
    '/owner/offerings',
    wrapAsync((req, res, next) => getOfferingsList(req, res, next)),
  );

  app.get(
    '/owner/services',
    wrapAsync((req, res, next) => getOfferingsList(req, res, next)),
  );

  app.get(
    '/owner/offerings/:id',
    wrapAsync((req, res, next) => getOffering(req, res, next)),
  );

  app.post(
    '/owner/offerings',
    wrapAsync((req, res, next) => createOffering(req, res, next, petri)),
  );

  app.post(
    '/owner/offerings/bulk',
    wrapAsync((req, res, next) => bulkCreateOfferings(req, res, next, petri)),
  );

  app.put(
    '/owner/offerings',
    wrapAsync((req, res, next) => updateOffering(req, res, next, petri)),
  );

  app.delete(
    '/owner/offerings/:id',
    wrapAsync((req, res, next) => deleteOffering(req, res, next)),
  );

  app.put(
    '/owner/offerings/order',
    wrapAsync((req, res, next) => updateOfferingListOrder(req, res, next)),
  );
}
