import { Paging } from '@wix/ambassador-services-catalog-server/rpc';
import { getServicesEligibleForCoupons } from '../adapters/coupons/coupons';
import { getterOfCouponEligibleServicesFactory } from '../adapters/coupons/coupons-rpc';

export async function getCouponEligibleServices(req, res, next) {
  const limit: number = req.query['paging.limit'];
  const offset: number = req.query['paging.offset'];
  const paging: Paging = { limit, offset };

  const services = await getServicesEligibleForCoupons(
    paging,
    getterOfCouponEligibleServicesFactory(req.aspects),
  );

  res.send({ services });
}
