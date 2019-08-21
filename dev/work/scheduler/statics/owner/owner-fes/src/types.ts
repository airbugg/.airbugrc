import { Request } from 'express';

interface WixRequest extends Request {
  url: string;
  aspects: WixAspects;
  userExperiments: any;
}

interface WixAspects {
  session: {
    userGuid: string;
  };
  'web-context': {
    url: string;
    userIp: string;
    userPort: number;
  };
}

export { WixRequest };
