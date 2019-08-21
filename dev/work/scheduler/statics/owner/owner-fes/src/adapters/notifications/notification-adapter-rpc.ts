import {
  Notification,
  NotificationsServer,
  TestResponse,
} from '@wix/ambassador-notifications-server';

export function updateNotificationsFactory(aspects) {
  const notificationsService = getNotificationsService(aspects);
  return async (notifications: Notification[]) => {
    return notificationsService.setup({ notifications });
  };
}
export function getNotificationSetupFactory(aspects) {
  const notificationsService = getNotificationsService(aspects);
  return async () => {
    const notificationResponse = await notificationsService.get({});
    return notificationResponse.notifications;
  };
}
function getNotificationsService(aspects) {
  return NotificationsServer().NotificationsSettings()(aspects);
}

export function testNotificationFactory(
  aspects,
): (Notification) => Promise<TestResponse> {
  const notificationService = getNotificationsService(aspects);
  return async (notification: Notification): Promise<TestResponse> => {
    return notificationService.test({ notification });
  };
}
