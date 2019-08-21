import { wrapAsync } from './index';
import {
  createAppointments,
  addParticipantToSession,
  getParticipantsForSession,
  removeParticipantFromSession,
  updateParticipantInBooking,
} from '../controllers/booking';
import { updateAppointment, deleteAppointment } from '../controllers/calendar';

export function setBookingsRoutes(app, petri) {
  app.post(
    '/owner/appointments',
    wrapAsync((req, res, next) => createAppointments(req, res, next)),
  );

  app.put(
    '/owner/appointments',
    wrapAsync((req, res, next) => updateAppointment(req, res)),
  );

  app.delete(
    '/owner/appointments/:sessionId/:serviceId',
    wrapAsync((req, res, next) => deleteAppointment(req, res)),
  );

  app.get(
    '/owner/sessions/participants/:sessionId',
    wrapAsync((req, res, next) => getParticipantsForSession(req, res, next)),
  );

  app.post(
    '/owner/sessions/:sessionId/participant',
    wrapAsync((req, res, next) => addParticipantToSession(req, res, next)),
  );

  app.delete(
    '/owner/sessions/:sessionId/participant/:bookingId',
    wrapAsync((req, res, next) => removeParticipantFromSession(req, res, next)),
  );

  app.put(
    '/owner/sessions/:sessionId/participant/:bookingId',
    wrapAsync((req, res, next) => updateParticipantInBooking(req, res, next)),
  );
}
