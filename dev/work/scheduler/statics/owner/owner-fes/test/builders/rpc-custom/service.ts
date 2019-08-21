import {
  aGetServiceResponse,
  aPrice,
  aPricingPlan,
  aRate,
  aSchedule,
  aService,
  aPaymentOptions,
  anImage,
  anURLs,
  aPageUrl,
} from '@wix/ambassador-services-catalog-server/builders';
import {
  aBookingPolicy,
  aServiceInfo,
} from '@wix/ambassador-services-server/builders';
import { Chance } from 'chance';
import {
  LABELED_PRICE,
  OfferingTypes,
} from '../../../src/dto/offerings/offerings.consts';
import { aResource } from '@wix/ambassador-resources-server/builders';
import {
  aNineToFive7DaysAWeekSchedule,
  aNineToFiveInterval,
  aSimpleSchedule,
} from './schedule-builder';

const chance = new Chance();

export function createAService() {
  const aServiceBuilder = aService().withInfo(
    aServiceInfo()
      .withName(chance.name())
      .build(),
  );
  return aServiceBuilder;
}

export function aServiceResponseWithPlan() {
  const schedule = aSchedule()
    .withRate(
      aRate()
        .withLabeledPriceOptions({
          [LABELED_PRICE]: aPrice()
            .withAmount('20.5')
            .build(),
        })
        .build(),
    )
    .withTags([chance.pickone([OfferingTypes.GROUP, OfferingTypes.INDIVIDUAL])])
    .build();
  return aGetServiceResponse()
    .withPricingPlans([
      aPricingPlan()
        .withId(chance.guid())
        .withName('Gold Price')
        .build(),
    ])
    .withSchedules([schedule])
    .withService(
      aService()
        .withInfo(
          aServiceInfo()
            .withName(chance.string())
            .withImages([anImage().build()])
            .build(),
        )
        .withScheduleIds([schedule.id])
        .withPaymentOptions(
          aPaymentOptions()
            .withWixPaidPlan(true)
            .build(),
        )
        .withId(chance.guid())
        .build(),
    );
}

export function TestService() {
  return aService()
    .withId(chance.guid())
    .withCustomProperties({
      order: `${chance.integer()}`,
      type: chance.string(),
    })
    .withInfo(
      aServiceInfo()
        .withDescription(chance.string())
        .withName(chance.string())
        .withTagLine(chance.string())
        .withImages([
          anImage()
            .withUrl(chance.string())
            .build(),
        ])
        .build(),
    )
    .withPolicy(
      aBookingPolicy()
        .withIsBookOnlineAllowed(true)
        .withMaxParticipantsPerBooking(chance.integer())
        .build(),
    )
    .withPaymentOptions(aPaymentOptions().build());
}

function TestResource() {
  return [
    aResource()
      .withSchedules([aSimpleSchedule([aNineToFiveInterval.bind(null, 'SUN')])])
      .build(),
  ];
}

export function TestUrls() {
  return anURLs()
    .withBookingPageUrl(aPageUrl().build())
    .withServicePageUrl(aPageUrl().build())
    .build();
}

export function TestServiceResponse({
  service = TestService().build(),
  resourceList = TestResource(),
  urls = TestUrls(),
} = {}) {
  const schedule = aNineToFive7DaysAWeekSchedule();
  return aGetServiceResponse()
    .withService(service)
    .withUrls(urls)
    .withSchedules([schedule])
    .withResources(resourceList);
}
