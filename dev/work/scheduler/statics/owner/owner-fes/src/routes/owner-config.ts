import { ownerConfig } from '../controllers/onwer-config';
import { wrapAsync } from './index';

export function setConfigRoutes(app, config, petri) {
  app.get(
    '/owner/config',
    wrapAsync((req, res, next) => ownerConfig(req, res, next, config, petri)),
  );
}
