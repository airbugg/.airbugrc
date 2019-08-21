import { NotificationsServer } from '@wix/ambassador-notifications-server/rpc';
import { aTestResponse } from '@wix/ambassador-notifications-server/builders';
import axios from 'axios';
import { testEmailBuilder } from '../builders/dto/test-email.dto.builder';

describe('email notifications:', () => {
  it('should send test email', async () => {
    ambassadorServer
      .createStub(NotificationsServer)
      .NotificationsSettings()
      .test.when(() => true)
      .resolve(aTestResponse().build());

    const res = await axios.post(
      app.getUrl('/owner/email/test'),
      new testEmailBuilder().Build(),
    );

    expect(res.status).toBe(200);
  });
});
