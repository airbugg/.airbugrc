import { GetServiceResponse } from '@wix/ambassador-services-catalog-server/rpc';
import { CouponEligibleOfferingDto } from '../../../dto/offerings/coupon-eligible-offering.dto';

const couponScopePrefix = 'bookings.service';

export const convertServiceToCouponEligibleService = (
  getServiceRes: GetServiceResponse,
): CouponEligibleOfferingDto => {
  return {
    id: getServiceId(getServiceRes),
    price: getServicePrice(getServiceRes),
    name: getServiceName(getServiceRes),
    couponScope: createCouponScope(getServiceRes),
    image: getServiceImage(getServiceRes),
  };
};

const getServiceId = (getServiceRes: GetServiceResponse) =>
  getServiceRes.service.id;
const getServicePrice = (getServiceRes: GetServiceResponse) =>
  getServiceRes.schedules[0].rate.labeledPriceOptions.general.amount;
const getServiceName = (getServiceRes: GetServiceResponse) =>
  getServiceRes.service.info.name;
const createCouponScope = (getServiceRes: GetServiceResponse) =>
  `${couponScopePrefix}.${getServiceId(getServiceRes)}`;
const getServiceImage = (getServiceRes: GetServiceResponse) =>
  getServiceRes.service.info.images
    ? getServiceRes.service.info.images[0]
    : null;
