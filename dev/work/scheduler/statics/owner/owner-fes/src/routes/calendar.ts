import { wrapAsync } from './index';
import {
  createClassSession,
  getCalendarItems,
  updateCourseSession,
  deleteSession,
  updateClassSession,
  createBlockedSession,
  updateBlockedSession,
  sessionPosition,
} from '../controllers/calendar';

export function setCalendarRoutes(app) {
  app.get(
    '/owner/sessions/sessionPosition/:sessionId',
    wrapAsync((req, res, next) => sessionPosition(req, res)),
  );

  app.get(
    '/owner/sessions/:start/:end',
    wrapAsync((req, res, next) => getCalendarItems(req, res, next)),
  );

  app.put(
    '/owner/sessions',
    wrapAsync((req, res, next) => updateCourseSession(req, res)),
  );

  app.delete(
    '/owner/sessions/:sessionId',
    wrapAsync((req, res, next) => deleteSession(req, res)),
  );

  app.post(
    '/owner/classes/inst',
    wrapAsync((req, res, next) => createClassSession(req, res)),
  );

  app.put(
    '/owner/classes/inst',
    wrapAsync((req, res, next) => updateClassSession(req, res)),
  );

  app.delete(
    '/owner/classes/inst/:sessionId',
    wrapAsync((req, res, next) => deleteSession(req, res)),
  );

  app.post(
    '/owner/personalAppointments',
    wrapAsync((req, res, next) => createBlockedSession(req, res)),
  );

  app.put(
    '/owner/personalAppointments',
    wrapAsync((req, res, next) => updateBlockedSession(req, res)),
  );

  app.delete(
    '/owner/personalAppointments/:sessionId',
    wrapAsync((req, res, next) => deleteSession(req, res)),
  );
}
