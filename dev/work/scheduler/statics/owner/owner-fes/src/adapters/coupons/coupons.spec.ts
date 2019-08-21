import { aGetServiceResponse } from '@wix/ambassador-services-catalog-server/builders';

import {
  GetServiceResponse,
  ListServicesRequest,
  Paging,
} from '@wix/ambassador-services-catalog-server/rpc';
import { getServicesEligibleForCoupons } from './coupons';
import { Chance } from 'chance';
import { CouponEligibleOfferingDto } from '../../dto/offerings/coupon-eligible-offering.dto';
import {
  aPrice,
  aSchedule,
  aService,
  aServiceInfo,
} from '@wix/ambassador-services-server/builders';
import { aRate } from '@wix/ambassador-checkout-server/builders';

describe('coupons', () => {
  const chance = new Chance();

  const createDummyGetServiceResponse: () => GetServiceResponse = () => {
    const someServiceInfo = aServiceInfo().build();
    const someService = aService()
      .withInfo(someServiceInfo)
      .build();
    const somePrice = aPrice().build();
    const someRate = aRate()
      .withLabeledPriceOptions({ general: somePrice })
      .build();
    const someSchedule = aSchedule()
      .withRate(someRate)
      .build();
    return aGetServiceResponse()
      .withService(someService)
      .withSchedules([someSchedule])
      .build();
  };

  it('should get all coupon eligible offerings', async () => {
    const dummyPaging: Paging = {
      limit: chance.integer({ min: 0, max: 20 }),
      offset: chance.integer({ min: 0, max: 20 }),
    };
    const numberOfEligibleOfferings = chance.integer({ min: 0, max: 20 });
    const couponEligibleOfferings = Array(numberOfEligibleOfferings).fill(
      createDummyGetServiceResponse(),
    );
    const getCouponEligibleServicesMock = jest.fn(
      async (_: ListServicesRequest) =>
        Promise.resolve({ services: couponEligibleOfferings }),
    );
    const expectedQuery = {
      fieldsets: null,
      filter: '{"isCouponEligible" : true}',
      paging: dummyPaging,
      fields: null,
      sort: null,
    };

    const offerings: CouponEligibleOfferingDto[] = await getServicesEligibleForCoupons(
      dummyPaging,
      getCouponEligibleServicesMock,
    );

    expect(getCouponEligibleServicesMock).toHaveBeenCalledWith({
      query: expectedQuery,
      includeDeleted: false,
    });
    expect(offerings.length).toBe(numberOfEligibleOfferings);
  });
});
