import { getSessions, mapSchedulesById } from './calendar-sessions-rpc';
import {
  convertSessionToCalendarItem,
  getStaffId,
  SessionOffering,
} from './mappers/calendar/sessions-to-calendar';
import { offeringsByScheduleId } from './offerings/offerings-catalog';
import { staffIdByScheduleId } from './resources/resources-adapter';
import { GetServiceResponse } from '@wix/ambassador-services-catalog-server/rpc';
import {
  CreateSessionRequest,
  CreateSessionResponse,
  DeleteSessionRequest,
  DeleteSessionResponse,
  GetScheduleResponse,
  GetSessionResponse,
  LinkedSchedule,
  LocalDateTime,
  Location,
  Session,
  Transparency,
  UpdateSessionRequest,
  UpdateSessionResponse,
} from '@wix/ambassador-schedule-server/rpc';
import {
  BlockedSession,
  CalendarItemType,
  ClassSession,
  CourseSession,
  IndividualSession,
} from '../dto/sessions/session.dto';
import {
  LocationTypes,
  OfferingTypes,
} from '../dto/offerings/offerings.consts';
import { ListResourcesResponse } from '@wix/ambassador-resources-server/rpc';
import * as moment from 'moment';
import { ListSessionsResponse } from '@wix/ambassador-calendar-server/rpc';
import {
  CancelerBook,
  GetterOfBookingsBySessionId,
  GetterOfScheduleById,
  GetterOfSessionById,
  UpdaterOfBooking,
} from './bookings/bookings-adapter-rpc';
import {
  UpdateBookingRequest,
  Booking,
  BookedEntity,
} from '@wix/ambassador-bookings-server/types';

export async function getCalendarItemsList(aspects, start, end) {
  const sessionsResponsePromise = getSessions(aspects, start, end);
  const offeringsPromise = offeringsByScheduleId(aspects, true);
  const staffPromise = staffIdByScheduleId(aspects);
  const [
    sessionsResponse,
    offeringsByScheduleIdMap,
    staffIdByScheduleIdMap,
  ] = await Promise.all([
    sessionsResponsePromise,
    offeringsPromise,
    staffPromise,
  ]);

  if (!sessionsResponse.sessions) {
    return { calendarItems: [] };
  }

  const coursesScheduleIds = sessionsResponse.sessions
    .filter(
      session => session.tags && session.tags.includes(OfferingTypes.COURSE),
    )
    .map(session => session.scheduleId);
  const allCoursesSchedules = await mapSchedulesById(
    aspects,
    coursesScheduleIds,
  );

  const calendarItems = sessionsResponse.sessions
    .map(session => {
      const offering: SessionOffering =
        offeringsByScheduleIdMap[session.scheduleId];

      const staffId = getStaffId(staffIdByScheduleIdMap, session);

      if (!offering && !staffId) {
        return null;
      }

      if (staffId && (!session.tags || session.tags === [])) {
        return null;
      }

      return convertSessionToCalendarItem(
        session,
        offering,
        staffId,
        allCoursesSchedules,
      );
    })
    .filter(item => !!item);
  return { calendarItems };
}

export async function updateAnAppointment(
  appointmentSession: IndividualSession,
  updaterOfBooking: UpdaterOfBooking,
  getterOfOfferingById: (id: string) => Promise<GetServiceResponse>,
  getterOfStaffById: (ids: string[]) => Promise<ListResourcesResponse>,
  getterOfBookingsBySessionId: GetterOfBookingsBySessionId,
) {
  const resourcesResponse = await getterOfStaffById([
    appointmentSession.staffMemberId,
  ]);
  const [{ bookingsEntries }, { schedules }] = await Promise.all([
    getterOfBookingsBySessionId(appointmentSession.id),
    getterOfOfferingById(appointmentSession.serviceId),
  ]);
  const affectedSchedules = getAffectedSchedule(resourcesResponse);
  const booking: Booking = bookingsEntries[0].booking;
  const bookedEntity: BookedEntity = booking.bookedEntity;
  const updateBookingRequest: UpdateBookingRequest = {
    createSession: {
      scheduleId: schedules[0].id,
      start: {
        timestamp: new Date(appointmentSession.from).toISOString(),
      },
      end: {
        timestamp: new Date(appointmentSession.to).toISOString(),
      },
      location: bookedEntity.location,
      rate: bookedEntity.rate,
      affectedSchedules,
      status: null,
      title: bookedEntity.title,
      scheduleOwnerId: bookedEntity.serviceId,
      tags: bookedEntity.tags, // TODO: remove it after it is changed to optional
      participants: null, // TODO: remove it after it is changed to optional
      totalNumberOfParticipants: null, // TODO: remove it after it is changed to optional
      id: null, // TODO: remove it after it is changed to optional
      notes: appointmentSession.notes, // TODO: remove it after it is changed to optional
      inheritedFields: null, // TODO: remove it after it is changed to optional
    },
    notifyParticipants: appointmentSession.sendEmail,
    id: booking.id,
    fieldMask: { paths: ['reschedule'] },
  };
  return updaterOfBooking(updateBookingRequest);
}

function createSessionForUpdate(
  id,
  affectedSchedules,
  start,
  end,
  notes,
  scheduleId = null,
  tags = [],
): Session {
  return {
    rate: null,
    location: null,
    scheduleOwnerId: null,
    title: null,
    participants: null,
    originalStart: null,
    inheritedFields: null,
    totalNumberOfParticipants: null,
    capacity: null,
    status: null,

    scheduleId,
    id,
    affectedSchedules,
    start: {
      timestamp: start,
    },
    end: {
      timestamp: end,
    },
    notes,
    tags,
  };
}

export async function updateACourseSession(
  courseSession: CourseSession,
  notifyUsersQueryParam: string,
  updatorOfSession: (
    request: UpdateSessionResponse,
  ) => Promise<UpdateSessionResponse>,
  getterOfOfferingById: (id: string) => Promise<GetServiceResponse>,
  getterOfStaffById: (ids: string[]) => Promise<ListResourcesResponse>,
) {
  const notifyParticipants = notifyUsersQueryParam === 'true';

  const resourcesResponse = await getterOfStaffById([
    courseSession.staffMemberId,
  ]);

  const session: Session = createSessionForUpdate(
    courseSession.id,
    getAffectedSchedule(resourcesResponse),
    getTimeStamp(courseSession.startTime),
    getTimeStamp(courseSession.endTime),
    courseSession.note,
  );

  const request: UpdateSessionRequest = {
    session,
    notifyParticipants,
    updated: { paths: ['affectedSchedules', 'start', 'end', 'notes'] },
  };

  return updatorOfSession(request);
}

const sortSessionsByStart = (sessionA, sessionB) => {
  const sessionAStart = sessionA.start.timestamp;
  const sessionBStart = sessionB.start.timestamp;
  let comparison = 0;
  if (sessionAStart >= sessionBStart) {
    comparison = 1;
  } else if (sessionAStart <= sessionBStart) {
    comparison = -1;
  }
  return comparison;
};

export async function getSessionPosition(
  sessionId: string,
  getSessionById: GetterOfSessionById,
  getScheduleById: GetterOfScheduleById,
  listSessionsByScheduleId: (
    scheduleId,
    start,
    end,
  ) => Promise<ListSessionsResponse>,
) {
  const sessionResponse: GetSessionResponse = await getSessionById(sessionId);
  const scheduleResponse: GetScheduleResponse = await getScheduleById(
    sessionResponse.session.scheduleId,
  );
  const allSessionsResponse: ListSessionsResponse = await listSessionsByScheduleId(
    scheduleResponse.schedule.id,
    scheduleResponse.schedule.firstSessionStart,
    scheduleResponse.schedule.lastSessionEnd,
  );

  const allSessions = allSessionsResponse.sessions;

  const total = (allSessions.length as number) + 1;
  const sessionInArray = allSessions.filter(
    filteredSession => filteredSession.id === sessionId,
  )[0];
  const num =
    (allSessions.sort(sortSessionsByStart).indexOf(sessionInArray) as number) +
    2;

  return { total, num };
}

export async function createOrUpdateABlockedSession(
  blockedSession: BlockedSession,
  creatorOrUpdatorOfSession: (
    request: CreateSessionResponse | UpdateSessionRequest,
  ) => Promise<CreateSessionResponse | UpdateSessionResponse>,
  getterOfStaffById: (ids: string[]) => Promise<ListResourcesResponse>,
) {
  const resourcesResponse = await getterOfStaffById([
    blockedSession.staffMemberId,
  ]);

  const session: Session = createSessionForUpdate(
    blockedSession.id,
    null, // getAffectedSchedule(resourcesResponse),
    getTimeStamp(blockedSession.from),
    getTimeStamp(blockedSession.to),
    blockedSession.notes,
    getStaffScheduleId(resourcesResponse),
    [CalendarItemType.Blocked],
  );

  const request: CreateSessionRequest | UpdateSessionRequest = {
    session,
  };

  return creatorOrUpdatorOfSession(request);
}

function getStaffScheduleId(resourcesResponse: ListResourcesResponse): string {
  return resourcesResponse.resources &&
    resourcesResponse.resources[0] &&
    resourcesResponse.resources[0].schedules &&
    resourcesResponse.resources[0].schedules[0]
    ? resourcesResponse.resources[0].schedules[0].id
    : '';
}

export async function createOrUpdateASessionFromDivergeClass(
  classSession: ClassSession,
  creatorOrUpdaterOfSession: (
    request: CreateSessionRequest | UpdateSessionRequest,
  ) => Promise<CreateSessionResponse> | UpdateSessionResponse,
  getterOfOfferingById: (id: string) => Promise<GetServiceResponse>,
  getterOfStaffById: (ids: string[]) => Promise<ListResourcesResponse>,
) {
  const serviceId = classSession.classProtoId || classSession.serviceId;
  const serviceResponse = await getterOfOfferingById(serviceId);
  const resourcesResponse = await getterOfStaffById([
    classSession.staffMemberId,
  ]);
  const sessionLength =
    serviceResponse.schedules &&
    serviceResponse.schedules.length &&
    serviceResponse.schedules[0].intervals &&
    serviceResponse.schedules[0].intervals.length &&
    serviceResponse.schedules[0].intervals[0].interval &&
    serviceResponse.schedules[0].intervals[0].interval.duration
      ? serviceResponse.schedules[0].intervals[0].interval.duration
      : 0;
  const session: Session = {
    location: getLocation(classSession),
    scheduleOwnerId: serviceId,
    tags: [OfferingTypes.GROUP],
    affectedSchedules: getAffectedSchedule(resourcesResponse),
    scheduleId: serviceResponse.service.scheduleIds[0],
    start: {
      localDateTime: getLocalDateTime(
        classSession.classTime,
        classSession.classDate,
      ),
    },
    end: {
      localDateTime: getLocalDateTime(
        classSession.classTime,
        classSession.classDate,
        sessionLength,
      ),
    },
    notes: classSession.notes,
    capacity: classSession.capacity,
    participants: null, //TODO: remove
    totalNumberOfParticipants: null, //TODO: remove
    id: classSession.id, //no always use token
    inheritedFields: null, //TODO: remove,
    status: null, //TODO: remove,
  };
  return creatorOrUpdaterOfSession({ session });
}

export async function deletePersonalAppointment(
  sessionId: string,
  notifyUsersQueryParam: string,
  cancelerBook: CancelerBook,
  getterOfBookingsBySessionId: GetterOfBookingsBySessionId,
) {
  const { bookingsEntries } = await getterOfBookingsBySessionId(sessionId);
  const notifyParticipants = notifyUsersQueryParam === 'true';
  return cancelerBook({
    notifyParticipants,
    id: bookingsEntries[0].booking.id,
  });
}

export async function deleteASession(
  sessionId: string,
  notifyUsersQueryParam: string,
  sessionDeleter: (
    request: DeleteSessionRequest,
  ) => Promise<DeleteSessionResponse>,
) {
  const notifyParticipants = notifyUsersQueryParam === 'true';
  return sessionDeleter({ id: sessionId, notifyParticipants });
}

function getLocalDateTime(
  classTime: string,
  classDate: string,
  minutesToAdd: number = 0,
): LocalDateTime {
  const timeAsMoment = moment(
    `${classDate} ${classTime}`,
    'YYYY-MM-DD HH:mm:ss.SSS',
  );
  timeAsMoment.add(minutesToAdd, 'minutes');
  return {
    hourOfDay: timeAsMoment.hour(),
    dayOfMonth: timeAsMoment.date(),
    year: timeAsMoment.year(),
    monthOfYear: timeAsMoment.month() + 1,
    minutesOfHour: timeAsMoment.minute(),
  };
}

function getTimeStamp(timestamp): string {
  return moment(timestamp).toISOString();
}

function getAffectedSchedule(
  resourcesResponse: ListResourcesResponse,
): LinkedSchedule[] {
  const staffResource = resourcesResponse.resources[0];
  const linkedSchedule: LinkedSchedule = {
    scheduleOwnerId: staffResource.id,
    transparency: Transparency.BUSY,
    scheduleId: staffResource.schedules[0].id,
  };
  return [linkedSchedule];
}

const getLocation = (classSession): Location => {
  let locationType;
  let address = null;

  switch (classSession.location) {
    case LocationTypes.CUSTOMER:
      locationType = 'CUSTOM';
      break;
    case LocationTypes.OTHER:
      locationType = 'OWNER_CUSTOM';
      address = classSession.locationText;
      break;
    case LocationTypes.BUSINESS:
    default:
      locationType = 'OWNER_BUSINESS';
  }

  return {
    address,
    locationType,
  };
};
