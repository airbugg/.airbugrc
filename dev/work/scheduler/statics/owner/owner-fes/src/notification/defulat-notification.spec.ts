import { getDefaultNotification, keyMap } from './defulat-notification';

describe('default notification map', () => {
  function getNotificationKey(tag, type): string {
    return `${keyMap.get(tag)}-${keyMap.get(type)}`;
  }

  it('create a map of all notification template', () => {
    const res = getDefaultNotification(key => `translated::${key}`);
    ['confirmation-email', 'cancellation-email', 'reminder-email'].forEach(
      (type: string) => {
        ['1-on-1', 'ongoing'].forEach((tag: string) => {
          const template = res.get(getNotificationKey(tag, type));
          expect(template.body).toBe(`translated::${type}.${tag}.default-body`);
          expect(template.subject).toBe(
            `translated::${type}.${tag}.default-title`,
          );
        });
      },
    );
  });
});
