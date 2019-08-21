import {
  createOrUpdateABlockedSession,
  createOrUpdateASessionFromDivergeClass,
  deleteASession,
  deletePersonalAppointment,
  getCalendarItemsList,
  getSessionPosition,
  updateACourseSession,
  updateAnAppointment,
} from '../adapters/calendar-sessions';
import {
  BlockedSession,
  ClassSession,
  CourseSession,
  IndividualSession,
} from '../dto/sessions/session.dto';
import {
  creatorOfSessionsFactory,
  getSessionsByScheduleIdFactory,
  sessionDeleter,
  updaterOfSessionsFactory,
} from '../adapters/calendar-sessions-rpc';
import { getterOfStaffByIdFactory } from '../adapters/resources/resources-adapter-rpc';
import { getterOfServiceByIdFactory } from '../adapters/offerings/services-catalog-rpc';
import {
  cancelBookFactory,
  getterOfBookingsBySessionIdFactory,
  getterOfScheduleByIdFactory,
  getterOfSessionByIdFactory,
  updateBookFactory,
} from '../adapters/bookings/bookings-adapter-rpc';
import { UpdateBookingResponse } from '@wix/ambassador-bookings-server/types';

export async function getCalendarItems(req, res, next) {
  const calendarItems = await getCalendarItemsList(
    req.aspects,
    req.params.start,
    req.params.end,
  );
  res.json(calendarItems);
}

export async function updateAppointment(req, res) {
  const appointmentSession: IndividualSession = req.body;
  const updateBookingResponse: UpdateBookingResponse = await updateAnAppointment(
    appointmentSession,
    updateBookFactory(req.aspects),
    getterOfServiceByIdFactory(req.aspects),
    getterOfStaffByIdFactory(req.aspects),
    getterOfBookingsBySessionIdFactory(req.aspects),
  );
  res.send({ updateBookingResponse });
}

export async function deleteAppointment(req, res) {
  const sessionId = req.params.sessionId;
  const { notifyUsers } = req.query;
  const sessionRes = await deletePersonalAppointment(
    sessionId,
    notifyUsers,
    cancelBookFactory(req.aspects),
    getterOfBookingsBySessionIdFactory(req.aspects),
  );
  res.send({ sessionRes });
}

export async function updateCourseSession(req, res) {
  const courseSession: CourseSession = req.body;
  const { notifyUsers } = req.query;
  const courseSessionRes = await updateACourseSession(
    courseSession,
    notifyUsers,
    updaterOfSessionsFactory(req.aspects),
    getterOfServiceByIdFactory(req.aspects),
    getterOfStaffByIdFactory(req.aspects),
  );
  res.send({ courseSessionRes });
}

export async function createClassSession(req, res) {
  const classSession: ClassSession = req.body;
  const classSessionRes = await createOrUpdateASessionFromDivergeClass(
    classSession,
    creatorOfSessionsFactory(req.aspects),
    getterOfServiceByIdFactory(req.aspects),
    getterOfStaffByIdFactory(req.aspects),
  );
  res.send({ classSessionRes });
}

export async function updateClassSession(req, res) {
  const classSession: ClassSession = req.body;
  const classSessionRes = await createOrUpdateASessionFromDivergeClass(
    classSession,
    updaterOfSessionsFactory(req.aspects),
    getterOfServiceByIdFactory(req.aspects),
    getterOfStaffByIdFactory(req.aspects),
  );
  res.send({ classSessionRes });
}

export async function deleteSession(req, res) {
  const sessionId = req.params.sessionId;
  const { notifyUsers } = req.query;
  const sessionRes = await deleteASession(
    sessionId,
    notifyUsers,
    sessionDeleter(req.aspects),
  );
  res.send({ sessionRes });
}

export async function createBlockedSession(req, res) {
  const blockedSession: BlockedSession = req.body;
  const blockedSessionRes = await createOrUpdateABlockedSession(
    blockedSession,
    creatorOfSessionsFactory(req.aspects),
    getterOfStaffByIdFactory(req.aspects),
  );
  res.send({ blockedSessionRes });
}

export async function updateBlockedSession(req, res) {
  const blockedSession: BlockedSession = req.body;
  const blockedSessionRes = await createOrUpdateABlockedSession(
    blockedSession,
    updaterOfSessionsFactory(req.aspects),
    getterOfStaffByIdFactory(req.aspects),
  );
  res.send({ blockedSessionRes });
}

export async function sessionPosition(req, res) {
  const sessionId = req.params.sessionId;

  const sessionPos = await getSessionPosition(
    sessionId,
    getterOfSessionByIdFactory(req.aspects),
    getterOfScheduleByIdFactory(req.aspects),
    getSessionsByScheduleIdFactory(req.aspects),
  );

  res.send(sessionPos);
}
