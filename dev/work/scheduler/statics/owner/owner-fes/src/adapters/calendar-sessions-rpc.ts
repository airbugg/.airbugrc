import {
  CalendarServer,
  ListSessionsRequest,
  ListSessionsResponse,
} from '@wix/ambassador-calendar-server/rpc';
import { makeLogged } from './rpc-executor';
import {
  CreateSessionRequest,
  DeleteSessionRequest,
  ScheduleServer,
  UpdateSessionRequest,
  ListSchedulesRequest,
  ListSchedulesResponse,
} from '@wix/ambassador-schedule-server/rpc';
import { Schedule } from '@wix/ambassador-services-catalog-server/rpc';

export function getSessions(
  aspects,
  start,
  end,
): Promise<ListSessionsResponse> {
  const request: ListSessionsRequest = {
    query: {
      filter: (`{ "from": "${new Date(+start).toISOString()}", ` +
        `"to": "${new Date(+end).toISOString()}" }"`) as any,
      fields: null,
      fieldsets: null,
      sort: [],
    },
  };
  return makeLogged(CalendarServer().CalendarService()(aspects).listSessions)(
    request,
  );
}

export function getByScheduleIdSessionsRequest(scheduleId, start, end) {
  return {
    query: {
      filter: (`{ "scheduleId" : "${scheduleId}", ` +
        `"from": "${new Date(start).toISOString()}", ` +
        `"to": "${new Date(end).toISOString()}" }`) as any,
      fields: null,
      fieldsets: null,
      sort: [],
    },
  };
}

export function getSessionsByScheduleIdFactory(aspects) {
  return (scheduleId, start, end) => {
    const request: ListSessionsRequest = getByScheduleIdSessionsRequest(
      scheduleId,
      start,
      end,
    );

    return makeLogged(CalendarServer().CalendarService()(aspects).listSessions)(
      request,
    );
  };
}

export function getSchedulesFactory(aspects) {
  return async (scheduleIds: string[]): Promise<ListSchedulesResponse> => {
    const request: ListSchedulesRequest = {
      scheduleIds,
      scheduleOwnerIds: null,
    };
    return makeLogged(ScheduleServer().Schedules()(aspects).list)(request);
  };
}

export async function mapSchedulesById(aspects, scheduleIds) {
  if (!scheduleIds || scheduleIds.length === 0) {
    return new Map();
  }

  const allScheduleResponse = await getSchedulesFactory(aspects)(scheduleIds);
  const schedules = !allScheduleResponse.schedules
    ? new Map()
    : allScheduleResponse.schedules.reduce((result, schedule) => {
        result[schedule.id] = schedule;

        return result;
      }, new Map());

  return schedules;
}

export function creatorOfSessionsFactory(aspects) {
  const scheduleServer = getScheduleServer(aspects);
  return async (req: CreateSessionRequest) => {
    return makeLogged(scheduleServer.createSession)(req);
  };
}

export function sessionDeleter(aspects) {
  const scheduleServer = getScheduleServer(aspects);
  return async (req: DeleteSessionRequest) =>
    makeLogged(scheduleServer.deleteSession)(req);
}

export function updaterOfSessionsFactory(aspects) {
  const scheduleServer = getScheduleServer(aspects);
  return async (req: UpdateSessionRequest) =>
    makeLogged(scheduleServer.updateSession)(req);
}

function getScheduleServer(aspects) {
  return ScheduleServer().Schedules()(aspects);
}

export function creatorOfScheduleFactory(aspects) {
  const scheduleServer = getScheduleServer(aspects);
  return async (schedule: Schedule) => {
    return makeLogged(scheduleServer.create)({ schedule });
  };
}
