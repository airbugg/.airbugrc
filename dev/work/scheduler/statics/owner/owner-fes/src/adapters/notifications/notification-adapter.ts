import {
  Notification,
  Template,
  TestResponse,
  Type,
} from '@wix/ambassador-notifications-server';
import { Business } from '../../dto/business-info/business-info.dto';
import { OfferingTypes } from '../../dto/offerings/offerings.consts';
import {
  emailServiceType,
  emailTypes,
  testEmailDto,
} from '../../dto/test-email.dto';
import { getDefaultNotification } from '../../notification/defulat-notification';

function getMapNotificationFromPlatform(
  notifications: Notification[],
): Map<string, Template> {
  const notificationMap: Map<string, Template> = new Map<string, Template>();
  notifications.forEach((notification: Notification) => {
    notificationMap.set(
      getNotificationKey(notification.tag, notification.type),
      notification.template,
    );
  });
  return notificationMap;
}

export function getNotificationMapWithDefault(
  notifications: Notification[],
  translateFunction: Function,
): Map<string, Template> {
  let notificationMap;
  if (hasNotification(notifications)) {
    notificationMap = getMapNotificationFromPlatform(notifications);
  } else {
    notificationMap = getDefaultNotification(translateFunction);
  }
  return notificationMap;
}

function hasNotification(notification: Notification[]): boolean {
  return notification ? true : false;
}

export function getNotificationKey(tag: string, type: string): string {
  return tag + '-' + type;
}

export function extractNotification(businessInfo: Business): any {
  const reminderTemplates = new Map<string, Template>();
  const confirmationTemplates = new Map<string, Template>();
  const cancellationTemplates = new Map<string, Template>();

  reminderTemplates.set(
    OfferingTypes.GROUP,
    businessInfo.remindersEmails.classEmail,
  );
  reminderTemplates.set(
    OfferingTypes.INDIVIDUAL,
    businessInfo.remindersEmails.individualEmail,
  );

  confirmationTemplates.set(
    OfferingTypes.GROUP,
    businessInfo.classConfirmationEmail,
  );
  confirmationTemplates.set(
    OfferingTypes.INDIVIDUAL,
    businessInfo.confirmationEmail,
  );

  cancellationTemplates.set(
    OfferingTypes.GROUP,
    businessInfo.groupCancellationEmail,
  );

  const notifications: Notification[] = [];
  reminderTemplates.forEach((template, tag) => {
    notifications.push(
      createNotification(
        template,
        tag,
        'REMINDER_EMAIL',
        businessInfo.useReminders,
      ),
    );
  });
  confirmationTemplates.forEach((template, tag) => {
    notifications.push(createNotification(template, tag, 'CONFIRMATION_EMAIL'));
  });
  cancellationTemplates.forEach((template, tag) => {
    notifications.push(createNotification(template, tag, 'CANCELLATION_EMAIL'));
  });
  return notifications;
}

function createNotification(
  template: Template,
  tag: string,
  type: Type,
  userReminder: boolean = false,
): Notification {
  return {
    template,
    tag,
    type,
    isEnabled: userReminder, //TODO: Update and return the right value
  };
}

export function sendTestNotification(
  testSender: (Notification) => Promise<TestResponse>,
  notificationDto: testEmailDto,
): Promise<TestResponse> {
  const notification: Notification = {
    template: {
      body: notificationDto.body,
      subject: notificationDto.subject,
    },
    type: mapNotificationDotTypeToPlatformType(notificationDto.emailType),
    isEnabled: true,
    tag: mapNotificationDtoServiceTypeToTag(notificationDto.serviceType),
  };

  return testSender(notification);
}

export function mapNotificationDotTypeToPlatformType(
  dtoType: emailTypes,
): Type {
  switch (dtoType) {
    case emailTypes.CANCELLATION:
      return 'CANCELLATION_EMAIL';
    case emailTypes.CONFIRMATION:
      return 'CONFIRMATION_EMAIL';
    case emailTypes.REMINDER:
      return 'REMINDER_EMAIL';
    default:
      return 'UNDEFINED';
  }
}

export function mapNotificationDtoServiceTypeToTag(
  dtoType: emailServiceType,
): OfferingTypes {
  return dtoType === emailServiceType.PRIVATE
    ? OfferingTypes.INDIVIDUAL
    : OfferingTypes.GROUP;
}

export function getUseReminders(notifications: Notification[]) {
  if (notifications) {
    const notificationReminder: Notification = findNotificationByType(
      notifications,
      'REMINDER_EMAIL',
    );
    return notificationReminder.isEnabled;
  }
  return false;
}

export function findNotificationByType(
  notifications: Notification[],
  type: string,
): Notification {
  return notifications.find(
    (notification: Notification) => notification.type === type,
  );
}
