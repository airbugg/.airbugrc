import { wrapAsync } from './index';
import { testEmail } from '../controllers/notifications';

export function setNotificationRoutes(app) {
  app.post(
    '/owner/email/test',
    wrapAsync((req, res, next) => testEmail(req, res, next)),
  );
}
