import { sendTestNotification } from '../adapters/notifications/notification-adapter';
import { testNotificationFactory } from '../adapters/notifications/notification-adapter-rpc';

export async function testEmail(req, res, next) {
  await sendTestNotification(testNotificationFactory(req.aspects), req.body);

  res.send(200);
}
