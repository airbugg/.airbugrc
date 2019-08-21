import { wrapAsync } from './index';

export function setADIRoutes(app) {
  app.get(
    '/onboarding/status',
    wrapAsync((req, res) => getADIStatus(req, res)),
  );
}

function getADIStatus(req, res) {
  res.send({ ready: true });
}
