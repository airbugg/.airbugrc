import { sendSync, sendUnsync } from '../adapters/external-calendar';

export const sendSyncEmail = async (req, res, next) => {
  const ret = await sendSync(req.aspects, req.params.staffId, req.query.email);
  res.status(200).send();
};

export const unsyncStaff = async (req, res, next) => {
  const ret = await sendUnsync(req.aspects, req.params.staffId);
  res.status(200).send();
};
