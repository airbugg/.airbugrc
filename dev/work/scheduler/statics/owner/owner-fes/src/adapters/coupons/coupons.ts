import {
  ListServicesRequest,
  ListServicesResponse,
  Paging,
  Query,
  Value,
} from '@wix/ambassador-services-catalog-server/index';
import { convertServiceToCouponEligibleService } from '../mappers/coupon/service-to-coupon-eligible-service';

const couponEligibleOfferingFilter = '{"isCouponEligible" : true}';

export async function getServicesEligibleForCoupons(
  paging: Paging,
  getterOfCouponEligibleServices: (
    request: ListServicesRequest,
  ) => Promise<ListServicesResponse>,
) {
  const query: Query = {
    paging,
    filter: couponEligibleOfferingFilter as Value,
    fields: null,
    fieldsets: null,
    sort: null,
  };
  const request: ListServicesRequest = {
    query,
    includeDeleted: false,
  };

  const services: ListServicesResponse = await getterOfCouponEligibleServices(
    request,
  );

  return services.services
    ? services.services.map(convertServiceToCouponEligibleService)
    : [];
}
