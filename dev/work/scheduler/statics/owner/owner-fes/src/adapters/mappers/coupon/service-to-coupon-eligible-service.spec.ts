import { aGetServiceResponse } from '@wix/ambassador-services-catalog-server/builders';
import {
  GetServiceResponse,
  Image,
} from '@wix/ambassador-services-catalog-server/rpc';

import { Chance } from 'chance';
import { convertServiceToCouponEligibleService } from './service-to-coupon-eligible-service';
import {
  aSchedule,
  aService,
  aServiceInfo,
} from '@wix/ambassador-services-server/builders';
import { aPrice, aRate } from '@wix/ambassador-checkout-server/builders';
import { anImage } from '@wix/ambassador-resources-server/builders';

describe('service to coupon eligible service', () => {
  const chance = new Chance();

  function createDummyGetServiceResponse({
    id = chance.guid(),
    price = chance.integer().toString(),
    name = chance.name(),
    image = anImage().build(),
  }): GetServiceResponse {
    const someServiceInfo = aServiceInfo()
      .withImages([image])
      .withName(name)
      .build();
    const someService = aService()
      .withId(id)
      .withInfo(someServiceInfo)
      .build();
    const somePrice = aPrice()
      .withAmount(price)
      .build();
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
  }

  it('with id', () => {
    const someId: string = chance.guid();
    const dummyServiceRes: GetServiceResponse = createDummyGetServiceResponse({
      id: someId,
    });

    const couponEligibleService = convertServiceToCouponEligibleService(
      dummyServiceRes,
    );

    expect(couponEligibleService.id).toBe(someId);
  });

  it('with price', () => {
    const somePrice: string = chance.integer().toString();
    const dummyServiceRes: GetServiceResponse = createDummyGetServiceResponse({
      price: somePrice,
    });

    const couponEligibleService = convertServiceToCouponEligibleService(
      dummyServiceRes,
    );

    expect(couponEligibleService.price).toBe(somePrice);
  });

  it('with name', () => {
    const someName: string = chance.name();
    const dummyServiceRes: GetServiceResponse = createDummyGetServiceResponse({
      name: someName,
    });

    const couponEligibleService = convertServiceToCouponEligibleService(
      dummyServiceRes,
    );

    expect(couponEligibleService.name).toBe(someName);
  });

  it('with image', () => {
    const someImage: Image = anImage().build();
    const dummyServiceRes: GetServiceResponse = createDummyGetServiceResponse({
      image: someImage,
    });

    const couponEligibleService = convertServiceToCouponEligibleService(
      dummyServiceRes,
    );

    expect(couponEligibleService.image.id).toBe(someImage.id);
    expect(couponEligibleService.image.url).toBe(someImage.url);
    expect(couponEligibleService.image.width).toBe(someImage.width);
    expect(couponEligibleService.image.height).toBe(someImage.height);
  });

  it('generates coupon scope', () => {
    const someId: string = chance.guid();
    const dummyServiceRes: GetServiceResponse = createDummyGetServiceResponse({
      id: someId,
    });

    const couponEligibleService = convertServiceToCouponEligibleService(
      dummyServiceRes,
    );

    expect(couponEligibleService.couponScope).toBe(
      `bookings.service.${someId}`,
    );
  });
});
