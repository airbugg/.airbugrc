import {
  ExternalCalendarServer,
  SendSyncEmailRequest,
  SendSyncEmailResponse,
  UnSyncRequest,
  UnSyncResponse,
} from '@wix/ambassador-external-calendar-server';
import { makeLogged } from './rpc-executor';

export async function sendSync(aspects, staffId: string, email: string) {
  const request: SendSyncEmailRequest = {
    resourceId: staffId,
    calendar: 'GOOGLE',
    syncRequestEmail: email,
  };
  const externalCalendarService = ExternalCalendarServer().SyncService();
  const grpcSendEmailSync: SendSyncEmailResponse = await makeLogged(
    externalCalendarService(aspects).sendSyncEmail,
  )(request);
  return grpcSendEmailSync;
}

export async function sendUnsync(aspects, staffId: string) {
  const request: UnSyncRequest = {
    resourceId: staffId,
    calendar: 'GOOGLE',
  };

  const externalCalendarService = ExternalCalendarServer().SyncService();

  const grpcSendEmailSync: UnSyncResponse = await makeLogged(
    externalCalendarService(aspects).unSync,
  )(request);
  return grpcSendEmailSync;
}

export async function getAllSyncStatuses(aspects) {
  const externalCalendarService = ExternalCalendarServer().SyncService();

  return makeLogged(externalCalendarService(aspects).list)({});
}
