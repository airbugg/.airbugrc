export const supportedLocales = new Set([
  'en',
  'da',
  'de',
  'hi',
  'it',
  'ja',
  'ko',
  'nl',
  'no',
  'ru',
  'sv',
  'tr',
  'fr',
  'es',
  'pt',
  'pl',
  'zh',
  'id',
  'th',
  'tl',
  'ro',
  'hu',
  'bg',
  'el',
  'cs',
  'fi',
  'he',
  'uk',
]);
export const defaultLang: string = 'en';

export function getMomentLocal(local: string): string {
  const lowerLocal = local.toLowerCase();
  switch (lowerLocal) {
    case 'no':
      return 'nb';
    case 'zh':
      return 'zh-hk';
    case 'tl':
      return 'tl-ph';
    default:
      if (supportedLocales.has(lowerLocal)) {
        return lowerLocal;
      }
      return defaultLang;
  }
}
