import { Location, Session } from '@wix/ambassador-calendar-server/rpc';
import {
  CalendarItemType,
  LocationTypes,
} from '../../../dto/sessions/session.dto';
import { OfferingTypes } from '../../../dto/offerings/offerings.consts';
import { LocationType, Schedule } from '@wix/ambassador-services-server';
import { ServiceLocationType } from '../../consts';
import { IndividualSessionDto } from '../../../dto/sessions/individual-session.dto';

export interface SessionOffering {
  id: string;
  name: string;
  uouHidden: boolean;
}

export const BLOCKED_OFFERING_ID = '00000000-0000-0000-0000-000000000000';

const getLocation = (sessionLocation: Location) => {
  return sessionLocation
    ? {
        address: sessionLocation.address,
        type: getLocationType(sessionLocation.locationType),
      }
    : {
        address: '',
        type: LocationTypes.BUSINESS,
      };
};

const getCustomer = sessionReservations => {
  return sessionReservations && sessionReservations[0]
    ? sessionReservations[0]
    : { name: '', email: '', phone: '' };
};

const getTimestamp = date => {
  return date && date.timestamp ? new Date(date.timestamp).getTime() : null;
};

const getValidOffering = offering => ({
  id: offering ? offering.id : null,
  name: offering ? offering.name : null,
  uouHidden: offering ? offering.uouHidden : null,
});

const getDuration = (start, end) => {
  // another hack - get  duration in minutes, instead of getting it from the offering
  return new Date(end - start).getTime() / (1000 * 60);
};

const getName = (session, offering, customer): string => {
  return getCalendarItemType(session) === CalendarItemType.Group
    ? offering.name
    : customer.name;
};

function getNumOfParticipants(
  schedules: Map<string, Schedule>,
  session: Session,
) {
  return schedules[session.scheduleId]
    ? schedules[session.scheduleId].totalNumberOfParticipants
    : session.totalNumberOfParticipants;
}

export function convertSessionToCalendarItem(
  session: Session,
  offering: SessionOffering,
  staffId: string,
  schedules: Map<string, Schedule> = new Map(),
): IndividualSessionDto {
  const customer = getCustomer(session.participants);
  const location = getLocation(session.location);
  offering = getValidOffering(offering);
  const sessionName = getSessionName(offering, session);
  const startTime = getTimestamp(session.start);
  const endTime = getTimestamp(session.end);
  const id = session ? session.id : null;
  const duration = getDuration(startTime, endTime);

  const numOfParticipants = getNumOfParticipants(schedules, session);
  const type = getCalendarItemType(session);
  return {
    id,
    type,
    startTime,
    endTime,
    registeredParticipants: numOfParticipants || 0,
    formattedLocation: location.address,
    locationType: location.type,
    note: session.notes,
    origin: {
      startTime,
      endTime,
      start: startTime,
      end: endTime,
      id,
      duration,
      phone: customer.phone,
      serviceId: offering.id,
      serviceName: session.title || customer.name || offering.name, //todo
      contactId: customer.contactId,
      name: getName(session, offering, customer),
      staffMemberName: staffId,
      staffMemberId: staffId,
      staffId,
      from: startTime,
      to: endTime,
      location: location.type,
      locatioText: location.address,
      notes: session.notes,
      numOfParticipants,
      capacity: session.capacity,
      email: customer.email,
      addressLine: location.address,
    },
    participantsCapacity: session.capacity,
    staffId: `${staffId}`,
    offeringId:
      type === CalendarItemType.Blocked
        ? BLOCKED_OFFERING_ID
        : offering.id || session.scheduleOwnerId,
    offeringName: session.title || offering.name,
    uouHidden: offering.uouHidden,
    customerName: customer.name,
    customerPhone: customer.phone,
    customerEmail: customer.email,
  };
}

function getSessionName(offering: SessionOffering, session: Session): string {
  if (
    [CalendarItemType.Group, CalendarItemType.Course].includes(
      getCalendarItemType(session),
    )
  ) {
    return offering.name;
  }
  return session.title;
}

function getLocationType(locationType: LocationType) {
  switch (locationType) {
    case ServiceLocationType.CUSTOM:
      return LocationTypes.CUSTOMER;
    case ServiceLocationType.OWNER_CUSTOM:
      return LocationTypes.OTHER;
    case ServiceLocationType.OWNER_BUSINESS:
    default:
      return LocationTypes.BUSINESS;
  }
}

export function getStaffId(staffIdByScheduleId: {}, session: Session): string {
  const allStaff = Object.keys(staffIdByScheduleId).map(
    key => staffIdByScheduleId[key],
  );

  if (allStaff.includes(session.scheduleOwnerId)) {
    return session.scheduleOwnerId;
  }

  const scheduleId =
    session.affectedSchedules && session.affectedSchedules[0]
      ? session.affectedSchedules[0].scheduleId
      : null;

  return scheduleId
    ? staffIdByScheduleId[session.affectedSchedules[0].scheduleId]
    : staffIdByScheduleId[session.scheduleId];
}

export function getCalendarItemType(session: Session): CalendarItemType {
  if (!session.tags || session.tags === []) {
    return null;
  }
  if (session.tags.includes(OfferingTypes.INDIVIDUAL)) {
    return CalendarItemType.Individual;
  }

  if (session.tags.includes(OfferingTypes.GROUP)) {
    return CalendarItemType.Group;
  }

  if (session.tags.includes(OfferingTypes.COURSE)) {
    return CalendarItemType.Course;
  }

  if (session.tags.includes(CalendarItemType.Blocked)) {
    return CalendarItemType.Blocked;
  }

  if (session.tags.includes(CalendarItemType.Google.toLowerCase())) {
    return CalendarItemType.Google;
  }

  return null;
}
