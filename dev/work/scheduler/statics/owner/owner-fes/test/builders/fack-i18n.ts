export const fackI18nInstance = {
  __: key => {
    return `translated  ::: ${key}--${this.locale}`;
  },
  setLocale: locale => {
    this.locale = locale;
  },
};
