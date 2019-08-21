import { getConfigedI18n } from './translator';

export interface Config {
  notification: {
    localPath: string;
  };
  appTopology: {
    appSecret: string;
    staticBaseUrl: string;
    staticsUrl: string;
  };
  i18n: any;
}
module.exports = context => {
  const config: Config = context.config.load('owner-fes');
  return { config };
};
