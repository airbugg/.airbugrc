import { sendSyncEmail, unsyncStaff } from '../controllers/external-calendar';
import { wrapAsync } from './index';
import {
  createStaff,
  deleteStaff,
  editStaff,
  getStaffList,
  staffAllowActions,
} from '../controllers/staff';

export function setStaffRoutes(app, petri, gatekeeprClient, apiGatewayClient) {
  app.post(
    '/owner/calendar/google/staff/:staffId',
    wrapAsync((req, res, next) => sendSyncEmail(req, res, next)),
  );

  app.delete(
    '/owner/calendar/google/authStaff/:staffId',
    wrapAsync((req, res, next) => unsyncStaff(req, res, next)),
  );

  app.get(
    '/owner/staff/?',
    wrapAsync((req, res, next) =>
      getStaffList(req, res, gatekeeprClient, apiGatewayClient, petri),
    ),
  );

  app.post(
    '/owner/staff/',
    wrapAsync((req, res, next) => createStaff(req, res)),
  );
  app.put('/owner/staff/', wrapAsync((req, res, next) => editStaff(req, res)));

  app.get(
    '/owner/staff/actions/:staffId',
    wrapAsync((req, res, next) => staffAllowActions(req, res, petri)),
  );
  app.delete(
    '/owner/staff/:staffId',
    wrapAsync((req, res, next) => deleteStaff(req, res)),
  );
}
