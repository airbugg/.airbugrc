import * as i18n from 'i18n';

export function getConfigedI18n(notificationPath) {
  i18n.configure({
    locales: ['en', 'de'],
    defaultLocale: 'en',
    prefix: 'messages_',
    directory: `${notificationPath}/translations`,
    api: {
      __: 'translate',
      __n: 'translateN',
    },
  });
  i18n.init();
  return i18n;
}
