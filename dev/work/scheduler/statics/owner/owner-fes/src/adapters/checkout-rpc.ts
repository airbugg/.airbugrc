import {
  CheckoutOptionsRequest,
  CheckoutOptionsResponse,
  CheckoutServer,
} from '@wix/ambassador-checkout-server';
import { makeLogged } from './rpc-executor';

export const getPlanBenefitFactory = aspects => async (
  request: CheckoutOptionsRequest,
): Promise<CheckoutOptionsResponse> => {
  return makeLogged(
    CheckoutServer().CheckoutBackend()(aspects).checkoutOptions,
  )(request);
};
