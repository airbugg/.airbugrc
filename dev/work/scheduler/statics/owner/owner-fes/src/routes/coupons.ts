import { wrapAsync } from './index';
import { getCouponEligibleServices } from '../controllers/coupons';

export function setCouponsRoutes(app) {
  app.get(
    '/owner/coupons/services',
    wrapAsync((req, res, next) => getCouponEligibleServices(req, res, next)),
  );
}
