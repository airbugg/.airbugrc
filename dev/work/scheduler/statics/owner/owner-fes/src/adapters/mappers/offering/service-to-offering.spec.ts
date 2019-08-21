import { Chance } from 'chance';
import {
  convertServiceCategoryToOfferingCategory,
  convertServiceToOffering,
} from './service-to-offering';
import {
  LABELED_PRICE,
  LocationTypes,
  OfferingTypes,
} from '../../../dto/offerings/offerings.consts';
import {
  OfferedAsType,
  OfferingCategory,
  PaymentType,
} from '../../../dto/offerings/offering.dto';
import {
  aNineToFive7DaysAWeekSchedule,
  aNineToFiveInterval,
  aSimpleSchedule,
} from '../../../../test/builders/rpc-custom/schedule-builder';
import { IndividualOfferingDto } from '../../../dto/offerings/individual-offering.dto';
import { CourseOfferingDto } from '../../../dto/offerings/course-offering.dto';
import { GroupOfferingDto } from '../../../dto/offerings/group-offering.dto';
import { URLs } from '@wix/ambassador-services-catalog-server/rpc';
import {
  aGetServiceResponse,
  anURLs,
  aPageUrl,
  aPricingPlan,
} from '@wix/ambassador-services-catalog-server/builders';
import { aBusinessResource } from '../../../../test/builders/rpc-custom/resource-builder';
import {
  aBookingPolicy,
  aCategory,
  anImage,
  anInterval,
  aPaymentOptions,
  aPrice,
  aSchedule,
  aService,
  aServiceInfo,
} from '@wix/ambassador-services-server/builders';
import {
  anAvailability,
  anAvailabilityConstraints,
  aRecurringInterval,
  aResource,
} from '@wix/ambassador-resources-server/builders';
import { aLocation, aRate } from '@wix/ambassador-checkout-server/builders';
import { Day } from '@wix/ambassador-services-server/types';
import { LocationType } from '@wix/ambassador-checkout-server/rpc';
import {
  TestService,
  TestServiceResponse,
} from '../../../../test/builders/rpc-custom/service';

describe('Service to Offering', () => {
  const chance = new Chance();
  const businessSchedule = aBusinessResource().schedules[0];

  it('returns offering with id, categoryId,urlName', async () => {
    const serviceResponse = TestServiceResponse().build();

    const offering = convertServiceToOffering(
      serviceResponse,
      businessSchedule,
    );

    const { service } = serviceResponse;
    expect(offering.id).toBe(service.id);
    expect(offering.categoryId).toBe(service.categoryId);
    // expect(offering.urlName).toBe(service.urls.servicePageUrl.path);
  });

  it('returns offering type', async () => {
    const offeringType = OfferingTypes.INDIVIDUAL;
    const serviceResponse = TestServiceResponse()
      .withSchedules([
        aSchedule()
          .withTags([offeringType])
          .build(),
      ])
      .build();

    const offering = convertServiceToOffering(
      serviceResponse,
      businessSchedule,
    );

    const { service } = serviceResponse;
    expect(offering.type).toBe(offeringType);
  });

  it('returns offering with info', async () => {
    const serviceResponse = TestServiceResponse().build();

    const offering = convertServiceToOffering(
      serviceResponse,
      businessSchedule,
    );

    const { service } = serviceResponse;
    expect(offering.info.name).toBe(service.info.name);
    expect(offering.info.description).toBe(service.info.description);
    expect(offering.info.tagLine).toBe(service.info.tagLine);
  });

  it('returns offering with urls', async () => {
    const dummyUrls: URLs = {
      servicePageUrl: {
        path: chance.string(),
        base: chance.string(),
      },
      bookingPageUrl: {
        base: chance.string(),
        path: chance.string(),
      },
    };
    const serviceResponse = TestServiceResponse({ urls: dummyUrls }).build();

    const offering = convertServiceToOffering(
      serviceResponse,
      businessSchedule,
    );

    expect(offering.urls.bookingPageUrl.path).toBe(
      dummyUrls.bookingPageUrl.path,
    );
    expect(offering.urls.bookingPageUrl.base).toBe(
      dummyUrls.bookingPageUrl.base,
    );
    expect(offering.urls.servicePageUrl.path).toBe(
      dummyUrls.servicePageUrl.path,
    );
    expect(offering.urls.servicePageUrl.base).toBe(
      dummyUrls.servicePageUrl.base,
    );
  });

  it('returns offering image', async () => {
    const expectedImageUri = 'image.png';
    const service = TestService()
      .withInfo(
        aServiceInfo()
          .withImages([
            anImage()
              .withUrl(`/aa/${expectedImageUri}`)
              .build(),
          ])
          .build(),
      )
      .build();

    const serviceResponse = TestServiceResponse({ service }).build();

    const offering = convertServiceToOffering(
      serviceResponse,
      businessSchedule,
    );

    const [receivesImage] = offering.info.images;
    const [expectedImage] = service.info.images;
    expect(receivesImage.width).toBe(expectedImage.width);
    expect(receivesImage.height).toBe(expectedImage.height);
    expect(receivesImage.relativeUri).toBe(expectedImageUri);
  });

  describe('isBookable', () => {
    it('appointment is bookable', () => {
      const service = TestService().build();

      const serviceResponse = TestServiceResponse({ service })
        .withSchedules([
          aSchedule()
            .withTags([OfferingTypes.INDIVIDUAL])
            .withAvailability(
              anAvailability()
                .withStart('2019-05-11T18:50:24.560Z')
                .withEnd(null)
                .build(),
            )
            .build(),
        ])
        .build();

      const offering = convertServiceToOffering(
        serviceResponse,
        businessSchedule,
      );

      expect(offering.schedulePolicy.isBookable).toBe(true);
    });

    it('course that started is not bookable', () => {
      const service = TestService().build();

      const serviceResponse = TestServiceResponse({ service })
        .withSchedules([
          aSchedule()
            .withTags([OfferingTypes.COURSE])
            .withAvailability(
              anAvailability()
                .withStart('2019-05-11T18:50:24.560Z')
                .build(),
            )
            .withIntervals([])
            .build(),
        ])
        .build();

      const offering = convertServiceToOffering(
        serviceResponse,
        businessSchedule,
      );

      expect(offering.schedulePolicy.isBookable).toBe(false);
    });

    it('class that ended is not bookable', () => {
      const service = TestService().build();

      const serviceResponse = TestServiceResponse({ service })
        .withSchedules([
          aSchedule()
            .withTags([OfferingTypes.GROUP])
            .withAvailability(
              anAvailability()
                .withEnd('2019-05-11T18:50:24.560Z')
                .build(),
            )
            .withIntervals([])
            .build(),
        ])
        .build();

      const offering = convertServiceToOffering(
        serviceResponse,
        businessSchedule,
      );

      expect(offering.schedulePolicy.isBookable).toBe(false);
    });

    it("class that hasn't ended is bookable", () => {
      const service = TestService().build();

      const serviceResponse = TestServiceResponse({ service })
        .withSchedules([
          aSchedule()
            .withTags([OfferingTypes.GROUP])
            .withAvailability(
              anAvailability()
                .withEnd('2030-05-11T18:50:24.560Z')
                .build(),
            )
            .withIntervals([])
            .build(),
        ])
        .build();

      const offering = convertServiceToOffering(
        serviceResponse,
        businessSchedule,
      );

      expect(offering.schedulePolicy.isBookable).toBe(true);
    });
  });

  it("doesn't crush when no images for offering", async () => {
    const service = TestService()
      .withInfo(
        aServiceInfo()
          .withImages(null)
          .build(),
      )
      .build();
    const serviceResponse = TestServiceResponse({ service }).build();
    const offering = convertServiceToOffering(
      serviceResponse,
      businessSchedule,
    );
  });

  describe('When defining offering scheduling policy', () => {
    it('indicates basic scheduling policy information - isBookOnlineAllowed,', async () => {
      const service = TestService().build();
      const serviceResponse = TestServiceResponse({ service }).build();

      const offering = convertServiceToOffering(
        serviceResponse,
        businessSchedule,
      );

      expect(offering.schedulePolicy.maxParticipantsPerOrder).toEqual(
        service.policy.maxParticipantsPerBooking,
      );
      expect(offering.schedulePolicy.displayOnlyNoBookFlow).toEqual(
        !service.policy.isBookOnlineAllowed,
      );
    });

    it('lists all the staff members', async () => {
      const resources = [aResource().build(), aResource().build()];
      const serviceResponse = TestServiceResponse()
        .withResources(resources)
        .build();

      const offering = convertServiceToOffering(
        serviceResponse,
        businessSchedule,
      );

      expect(
        (offering as IndividualOfferingDto).schedulePolicy.staffMembersIds,
      ).toEqual(resources.map(({ id }) => id));
    });

    it('returns offering with indication whether the service is hidden', async () => {
      const expectedUoUHiddenValue = true;
      const service = TestService()
        .withCustomProperties({
          uouHidden: `${expectedUoUHiddenValue}`,
        })
        .build();
      const serviceResponse = TestServiceResponse({ service }).build();

      const offering = convertServiceToOffering(
        serviceResponse,
        businessSchedule,
      );

      expect(offering.schedulePolicy.uouHidden).toBe(expectedUoUHiddenValue);
    });
  });

  describe('When defining offering price', () => {
    it('mark offering as paid online', async () => {
      const service = TestService()
        .withPaymentOptions(
          aPaymentOptions()
            .withWixPayOnline(true)
            .withWixPayInPerson(false)
            .withCustom(false)
            .build(),
        )
        .build();

      const serviceResponse = TestServiceResponse({ service })
        .withSchedules([
          aSchedule()
            .withRate(
              aRate()
                .withLabeledPriceOptions({ [LABELED_PRICE]: aPrice().build() })
                .build(),
            )
            .build(),
        ])
        .build();
      serviceResponse.schedules[0].rate.labeledPriceOptions[
        LABELED_PRICE
      ].amount = '10';
      console.log('serviceResponse', serviceResponse.schedules[0].rate);
      console.log('serviceResponse', serviceResponse.service.paymentOptions);
      const offering = convertServiceToOffering(
        serviceResponse,
        businessSchedule,
      );

      expect(offering.payment.paymentType).toBe(PaymentType.ONLINE);
    });

    it('mark offering as paid offline', async () => {
      const service = TestService()
        .withPaymentOptions(
          aPaymentOptions()
            .withWixPayOnline(false)
            .withWixPayInPerson(true)
            .build(),
        )
        .build();
      const serviceResponse = TestServiceResponse({ service }).build();

      const offering = convertServiceToOffering(
        serviceResponse,
        businessSchedule,
      );

      expect(offering.payment.paymentType).toBe(PaymentType.OFFLINE);
    });

    it('mark offering as paid both offline and online', async () => {
      const service = TestService()
        .withPaymentOptions(
          aPaymentOptions()
            .withWixPayOnline(true)
            .withWixPayInPerson(true)
            .withCustom(false)
            .build(),
        )
        .build();
      const serviceResponse = TestServiceResponse({ service }).build();

      const offering = convertServiceToOffering(
        serviceResponse,
        businessSchedule,
      );

      expect(offering.payment.paymentType).toBe(PaymentType.ALL);
    });

    it('mark offering as free', async () => {
      const isFree = true;
      const priceText = chance.sentence();
      const service = TestService()
        .withPaymentOptions(
          aPaymentOptions()
            .withWixPayOnline(false)
            .withWixPayInPerson(false)
            .withWixPaidPlan(false)
            .withCustom(isFree)
            .build(),
        )
        .build();
      const serviceResponse = TestServiceResponse({ service })
        .withSchedules([
          aSchedule()
            .withRate(
              aRate()
                .withLabeledPriceOptions(null)
                .withPriceText(priceText)
                .build(),
            )
            .build(),
        ])
        .withPricingPlans([])
        .build();

      const offering = convertServiceToOffering(
        serviceResponse,
        businessSchedule,
      );

      expect(offering.payment.isFree).toBe(isFree);
      expect(offering.payment.price).toBe(0);
      expect(offering.payment.paymentType).toBe(PaymentType.OFFLINE);
      expect(offering.payment.priceText).toBe(priceText);
      expect(offering.offeredAs).toEqual([OfferedAsType.ONE_TIME]);
    });

    it('mark offering offered as one time', async () => {
      const serviceResponse = TestServiceResponse()
        .withPricingPlans([])
        .withSchedules([
          aSchedule()
            .withRate(
              aRate()
                .withLabeledPriceOptions({
                  general: { amount: '1', downPayAmount: '', currency: '' },
                })
                .build(),
            )
            .build(),
        ])
        .build();
      serviceResponse.service.paymentOptions.wixPaidPlan = false;
      console.log('serviceResponse', serviceResponse);
      console.log('businessSchedule', businessSchedule);
      const offering = convertServiceToOffering(
        serviceResponse,
        businessSchedule,
      );

      expect(offering.offeredAs).toEqual([OfferedAsType.ONE_TIME]);
    });

    describe('with pricing plan', () => {
      it('mark offering offered as pricing plan', async () => {
        const service = TestService()
          .withPaymentOptions(
            aPaymentOptions()
              .withWixPaidPlan(false)
              .build(),
          )
          .build();

        const serviceResponse = TestServiceResponse({ service })
          .withPricingPlans([aPricingPlan().build()])
          .build();
        serviceResponse.schedules[0].rate = null;
        const offering = convertServiceToOffering(
          serviceResponse,
          businessSchedule,
        );

        expect(offering.offeredAs).toContain(OfferedAsType.PRICING_PLAN);
      });

      it('mark offering offered as pricing plan and one time', async () => {
        const service = TestService()
          .withPaymentOptions(
            aPaymentOptions()
              .withWixPayInPerson(true)
              .build(),
          )
          .build();

        const serviceResponse = TestServiceResponse({ service })
          .withPricingPlans([aPricingPlan().build()])
          .withSchedules([
            aSchedule()
              .withRate(
                aRate()
                  .withLabeledPriceOptions({
                    general: { amount: '1', downPayAmount: '', currency: '' },
                  })
                  .build(),
              )
              .build(),
          ])
          .build();

        const offering = convertServiceToOffering(
          serviceResponse,
          businessSchedule,
        );

        expect(offering.offeredAs).toEqual([
          OfferedAsType.PRICING_PLAN,
          OfferedAsType.ONE_TIME,
        ]);
      });
    });

    describe('without pricing plans', () => {
      it('mark offering offered as pricing plan', async () => {
        const membershipText = chance.sentence();
        const service = TestService()
          .withPaymentOptions(
            aPaymentOptions()
              .withWixPaidPlan(true)
              .withCustom(false)
              .withWixPayOnline(false)
              .build(),
          )
          .build();
        const serviceResponse = TestServiceResponse({ service })
          .withPricingPlans([])
          .withSchedules([
            aSchedule()
              .withRate(
                aRate()
                  .withLabeledPriceOptions({})
                  .withPriceText(membershipText)
                  .build(),
              )
              .build(),
          ])
          .build();
        const offering = convertServiceToOffering(
          serviceResponse,
          businessSchedule,
        );

        expect(offering.offeredAs).toEqual([OfferedAsType.PRICING_PLAN]);
        expect(offering.pricingPlanInfo.displayText).toEqual(membershipText);
      });

      it('mark offering offered as pricing plan and one time', async () => {
        const membershipText = chance.sentence();
        const amount = chance.integer({ max: 100, min: 10 });
        const downPayAmount = chance.integer({ max: 100, min: 10 });
        const currency = chance.currency().code;
        const rate = aRate()
          .withLabeledPriceOptions({
            general: {
              amount: amount.toString(),
              currency,
              downPayAmount: downPayAmount.toString(),
            },
          })
          .withPriceText(membershipText)
          .build();

        const service = TestService()
          .withPaymentOptions(
            aPaymentOptions()
              .withWixPayInPerson(true)
              .withWixPaidPlan(true)
              .withCustom(false)
              .build(),
          )
          .build();
        const serviceResponse = TestServiceResponse({ service })
          .withPricingPlans([])
          .withSchedules([
            aSchedule()
              .withRate(rate)
              .build(),
          ])
          .build();

        const offering = convertServiceToOffering(
          serviceResponse,
          businessSchedule,
        );

        expect(offering.offeredAs).toEqual([
          OfferedAsType.PRICING_PLAN,
          OfferedAsType.ONE_TIME,
        ]);
        expect(offering.pricingPlanInfo.displayText).toEqual(membershipText);
        expect(offering.payment.price).toBe(amount);
        expect(offering.payment.currency).toBe(currency);
      });
    });
  });

  describe('when defining schedule', () => {
    it('with capacity', () => {
      const capacity = chance.integer();
      const serviceResponse = TestServiceResponse()
        .withSchedules([
          aSchedule()
            .withCapacity(capacity)
            .build(),
        ])
        .build();

      const offering = convertServiceToOffering(
        serviceResponse,
        businessSchedule,
      );

      expect(offering.schedulePolicy.capacity).toBe(capacity);
    });

    it('with payment', () => {
      const amount = chance.integer({ max: 100, min: 10 });
      const downPayAmount = `${amount / 2}`;
      const currency = chance.currency().code;
      const priceText = chance.sentence();
      const rate = aRate()
        .withLabeledPriceOptions({
          general: {
            amount: amount.toString(),
            currency,
            downPayAmount: downPayAmount.toString(),
          },
        })
        .withPriceText(priceText)
        .build();
      const service = TestService()
        .withPaymentOptions(
          aPaymentOptions()
            .withWixPaidPlan(true)
            .withCustom(false)
            .build(),
        )
        .build();
      const serviceResponse = TestServiceResponse({ service })
        .withSchedules([
          aSchedule()
            .withRate(rate)
            .build(),
        ])
        .build();

      const offering = convertServiceToOffering(
        serviceResponse,
        businessSchedule,
      );

      expect(offering.payment.price).toBe(amount);
      expect(offering.payment.currency).toBe(currency);
      expect(offering.payment.minCharge).toBe(+downPayAmount);
      expect(offering.payment.priceText).toBe(priceText);
    });

    it('with minutesBetweenAppointments, uouHidden', () => {
      const timeBetweenSlots = chance.integer({ min: 10, max: 55 });
      const uouHidden = true;
      const service = TestService()
        .withCustomProperties({
          uouHidden: `${uouHidden}`,
        })
        .build();
      const serviceResponse = TestServiceResponse({ service })
        .withSchedules([
          aSchedule()
            .withAvailability(
              anAvailability()
                .withConstraints(
                  anAvailabilityConstraints()
                    .withTimeBetweenSlots(timeBetweenSlots)
                    .build(),
                )
                .build(),
            )
            .build(),
        ])
        .build();

      const offering = convertServiceToOffering(
        serviceResponse,
        businessSchedule,
      );

      expect(
        (offering as IndividualOfferingDto).schedulePolicy
          .minutesBetweenAppointments,
      ).toBe(timeBetweenSlots);

      expect(offering.schedulePolicy.uouHidden).toBe(uouHidden);
    });

    describe('with location', () => {
      it('with owner business', () => {
        const address = chance.address();
        const locationType = LocationType.OWNER_BUSINESS;
        const location = aLocation()
          .withAddress(address)
          .withLocationType(locationType)
          .build();
        const serviceResponse = TestServiceResponse()
          .withSchedules([
            aSchedule()
              .withLocation(location)
              .build(),
          ])
          .build();

        const offering = convertServiceToOffering(
          serviceResponse,
          businessSchedule,
        );

        expect(offering.location.type).toBe(LocationTypes.BUSINESS);
        expect(offering.location.locationText).toBe(null);
      });

      it('with owner other', () => {
        const address = chance.address();
        const locationType = LocationType.OWNER_CUSTOM;
        const location = aLocation()
          .withAddress(address)
          .withLocationType(locationType)
          .build();
        const serviceResponse = TestServiceResponse()
          .withSchedules([
            aSchedule()
              .withLocation(location)
              .build(),
          ])
          .build();

        const offering = convertServiceToOffering(
          serviceResponse,
          businessSchedule,
        );

        expect(offering.location.type).toBe(LocationTypes.OTHER);
        expect(offering.location.locationText).toBe(address);
      });

      it("with customer's", () => {
        const address = chance.address();
        const locationType = LocationType.CUSTOM;
        const location = aLocation()
          .withAddress(address)
          .withLocationType(locationType)
          .build();
        const serviceResponse = TestServiceResponse()
          .withSchedules([
            aSchedule()
              .withLocation(location)
              .build(),
          ])
          .build();

        const offering = convertServiceToOffering(
          serviceResponse,
          businessSchedule,
        );

        expect(offering.location.type).toBe(LocationTypes.CUSTOMER);
        expect(offering.location.locationText).toBe(null);
      });
    });

    it('without schedule', () => {
      const serviceResponse = TestServiceResponse()
        .withSchedules(null)
        .build();

      const offering = convertServiceToOffering(
        serviceResponse,
        businessSchedule,
      );

      expect(offering).toBeDefined();
    });

    describe('individual offering/schedule', () => {
      it('return staff availability for individual offering', () => {
        const service = TestService().build();
        const serviceResponse = TestServiceResponse({ service }).build();
        serviceResponse.schedules[0].tags = [OfferingTypes.INDIVIDUAL];
        const offering = convertServiceToOffering(
          serviceResponse,
          businessSchedule,
        );
        expect(
          (offering as IndividualOfferingDto).schedule.staffAvailability,
        ).toBeDefined();
      });

      it('durationInMinutes', () => {
        const service = TestService().build();
        const duration = chance.integer({ min: 10, max: 60 });
        const serviceResponse = TestServiceResponse({ service })
          .withSchedules([
            aSchedule()
              .withAvailability(
                anAvailability()
                  .withConstraints(
                    anAvailabilityConstraints()
                      .withSlotDurations([duration])
                      .build(),
                  )
                  .build(),
              )
              .build(),
          ])
          .build();
        const offering = convertServiceToOffering(
          serviceResponse,
          businessSchedule,
        );
        expect(
          (offering as IndividualOfferingDto).schedule.durationInMinutes,
        ).toBe(duration);
      });
    });

    it('durationInMinutes for class', () => {
      const service = TestService().build();
      const duration = chance.integer({ min: 10, max: 60 });
      const interval = aRecurringInterval()
        .withInterval(
          anInterval()
            .withDuration(duration)
            .withDaysOfWeek(Day.MON)
            .build(),
        )
        .build();
      const serviceResponse = TestServiceResponse({ service })
        .withSchedules([
          aSchedule()
            .withIntervals([interval])
            .withTags([OfferingTypes.GROUP])
            .build(),
        ])
        .build();
      const offering = convertServiceToOffering(
        serviceResponse,
        businessSchedule,
      );
      expect((offering as GroupOfferingDto).schedule.durationInMinutes).toBe(
        duration,
      );
    });

    it('service with frequency', () => {
      const repetition = chance.integer({ min: 1, max: 10 });

      const service = TestService().build();
      const serviceResponse = TestServiceResponse({ service })
        .withSchedules([
          aSchedule()
            .withIntervals([
              aRecurringInterval()
                .withInterval(
                  anInterval()
                    .withDaysOfWeek(Day.MON)
                    .withHourOfDay(12)
                    .build(),
                )
                .withFrequency({ repetition })
                .build(),
            ])
            .withTags([OfferingTypes.COURSE])
            .build(),
        ])
        .build();
      const offering = convertServiceToOffering(
        serviceResponse,
        businessSchedule,
      );
      expect((offering as CourseOfferingDto).schedule.repeatEveryXWeeks).toBe(
        repetition,
      );
    });
  });

  describe('convert categories', () => {
    it('with id,name,type', async () => {
      const serviceCategory = aCategory().build();
      const expectedCategory: OfferingCategory = {
        id: serviceCategory.id,
        name: serviceCategory.name,
        order: 0,
        type: 'SERVICE',
      };
      const serviceResponse = TestServiceResponse()
        .withCategory(serviceCategory)
        .build();

      const category = convertServiceCategoryToOfferingCategory(
        serviceResponse.category,
      );

      expect(category).toEqual(expectedCategory);
    });

    //todo
    // it('with order', async () => {
    // });
  });
});
