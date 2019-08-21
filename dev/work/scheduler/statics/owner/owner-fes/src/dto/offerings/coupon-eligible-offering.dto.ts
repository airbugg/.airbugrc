import { Image } from '@wix/ambassador-services-catalog-server/rpc';

export interface CouponEligibleOfferingDto {
  id: string;
  name: string;
  couponScope: string;
  image: Image;
  price: string;
}
