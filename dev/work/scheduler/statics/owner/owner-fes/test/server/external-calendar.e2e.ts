import axios from 'axios';
import {
  Calendar,
  ExternalCalendarServer,
  SendSyncEmailRequest,
  UnSyncRequest,
} from '@wix/ambassador-external-calendar-server/rpc';

describe('ExternalCalendar', () => {
  it('sync calls rpc', async () => {
    const serverStub = ambassadorServer.createStub(ExternalCalendarServer);
    const onEmailSent = jest.fn();
    const staffId = 'nushi';
    const email = 'einavc@wix.com';

    const request: SendSyncEmailRequest = {
      resourceId: staffId,
      calendar: Calendar.GOOGLE,
      syncRequestEmail: email,
    };

    serverStub
      .SyncService()
      .sendSyncEmail.when(request)
      .call(onEmailSent);

    const res = await axios.post(
      app.getUrl(
        `/owner/calendar/google/staff/${staffId}/?email=${encodeURIComponent(
          email,
        )}`,
      ),
    );
    expect(res.status).toBe(200);
    expect(onEmailSent).toHaveBeenCalledWith(request);
  });

  it('unsync calls rpc', async () => {
    const serverStub = ambassadorServer.createStub(ExternalCalendarServer);
    const onUnsyncCalled = jest.fn();
    const staffId = 'nushi';

    const request: UnSyncRequest = {
      resourceId: staffId,
      calendar: Calendar.GOOGLE,
    };

    serverStub
      .SyncService()
      .unSync.when(request)
      .call(onUnsyncCalled);

    const res = await axios.delete(
      app.getUrl(`/owner/calendar/google/authStaff/${staffId}`),
    );
    expect(res.status).toBe(200);
    expect(onUnsyncCalled).toHaveBeenCalledWith(request);
  });
});
