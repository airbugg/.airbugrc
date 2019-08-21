import * as WixInstanceNamespace from '@wix/wix-instance';

export const getInstance = req => {
  return req.headers.authorization || req.headers.Authorization;
};

export const decodeWixInstance = ({
  instance,
}): WixInstanceNamespace.DecodedInstance => {
  return WixInstanceNamespace.parse(instance);
};
