import { Template } from '@wix/ambassador-notifications-server';
import { OfferingTypes } from '../dto/offerings/offerings.consts';
import { getNotificationKey } from '../adapters/notifications/notification-adapter';

export const keyMap = new Map<string, string>();

keyMap.set('confirmation-email', 'CONFIRMATION_EMAIL');
keyMap.set('cancellation-email', 'CANCELLATION_EMAIL');
keyMap.set('reminder-email', 'REMINDER_EMAIL');
keyMap.set('1-on-1', OfferingTypes.INDIVIDUAL);
keyMap.set('ongoing', OfferingTypes.GROUP);
export function getDefaultNotification(translateFunction: Function) {
  const notificationMap: Map<string, Template> = new Map<string, Template>();
  ['1-on-1', 'ongoing'].forEach(tag => {
    ['confirmation-email', 'cancellation-email', 'reminder-email'].forEach(
      type => {
        notificationMap.set(
          getNotificationKey(keyMap.get(tag), keyMap.get(type)),
          getDefaultTemplate(tag, type, translateFunction),
        );
      },
    );
  });
  return notificationMap;
}

function getTranslationKey(param: {
  tag: string;
  type: string;
  emailSection: string;
}) {
  return `${param.type}.${param.tag}.default-${param.emailSection}`;
}

function getDefaultTemplate(tag: string, type: string, t: Function): Template {
  return {
    body: t(getTranslationKey({ tag, type, emailSection: 'body' })),
    subject: t(getTranslationKey({ tag, type, emailSection: 'title' })),
  };
}
