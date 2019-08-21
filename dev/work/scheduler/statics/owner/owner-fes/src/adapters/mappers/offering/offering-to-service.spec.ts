import {
  convertOfferingToOrderedService,
  convertOfferingToSchedule,
  convertOfferingToService,
  convertOfferingToUpdateServiceRequest,
  DEFAULT_SPLIT_INTERVAL,
  getLinkedSchedule,
  getStaffByOffering,
} from './offering-to-service';
import { Chance } from 'chance';
import { IndividualOfferingDtoBuilder } from '../../../../test/builders/dto/individual-offering.dto.builder';
import {
  OfferedAsType,
  OfferingImage,
  PaymentType,
} from '../../../dto/offerings/offering.dto';
import {
  aClassHour,
  aWorkingHour,
  someClassHours,
  GroupOfferingDtoBuilder,
} from '../../../../test/builders/dto/group-offering.dto.builder';
import {
  LABELED_PRICE,
  LocationType,
  LocationTypes,
} from '../../../dto/offerings/offerings.consts';
import { ServiceLocationType, Transparency } from '../../consts';
import { DAYS_OF_WEEK } from '../working-hours/working-hours-to-schedule-mapper';
import { CourseOfferingDtoBuilder } from '../../../../test/builders/dto/course-offering.dto.builder';
import { BookingPolicyProperty } from '../../business/busniess-adapter-rpc';
import { Service } from '@wix/ambassador-services-server/rpc';
import { IndividualOfferingDto } from '../../../dto/offerings/individual-offering.dto';
import { GroupOfferingDto } from '../../../dto/offerings/group-offering.dto';
import { CourseOfferingDto } from '../../../dto/offerings/course-offering.dto';
import { Schedule } from '@wix/ambassador-schedule-server/types';

const moment = require('moment-timezone');

describe('service response from offering', () => {
  const chance = new Chance();
  const timezone = 'Etc/UTC';
  let experiments;
  beforeEach(() => {
    experiments = {
      'specs.wos.BookingsFitness': 'true',
    };
  });
  describe('create a service', () => {
    describe('with payment options', () => {
      it('all', async () => {
        const offering = new IndividualOfferingDtoBuilder()
          .withPaymentType(PaymentType.ALL)
          .build();

        const service = convertOfferingToService(offering);

        expect(service.paymentOptions.wixPayInPerson).toBe(true);
        expect(service.paymentOptions.wixPayOnline).toBe(true);
        expect(service.paymentOptions.custom).toBe(false);
      });

      it('offline', async () => {
        const offering = new IndividualOfferingDtoBuilder()
          .withPaymentType(PaymentType.OFFLINE)
          .build();

        const service = convertOfferingToService(offering);

        expect(service.paymentOptions.wixPayInPerson).toBe(true);
        expect(service.paymentOptions.wixPayOnline).toBe(false);
        expect(service.paymentOptions.custom).toBe(false);
      });

      it('online', async () => {
        const offering = new IndividualOfferingDtoBuilder()
          .withPaymentType(PaymentType.ONLINE)
          .build();

        const service = convertOfferingToService(offering);

        expect(service.paymentOptions.wixPayInPerson).toBe(false);
        expect(service.paymentOptions.wixPayOnline).toBe(true);
        expect(service.paymentOptions.custom).toBe(false);
      });

      it('isFree', async () => {
        const priceText = chance.sentence();
        const isFree = true;
        const offering = new IndividualOfferingDtoBuilder()
          .withPayment({ isFree, priceText, paymentType: PaymentType.ONLINE })
          .build();

        const service = convertOfferingToService(offering);
        const schedule = convertOfferingToSchedule(offering);

        expect(schedule.rate[LABELED_PRICE]).not.toBeDefined();
        expect(service.paymentOptions.wixPayInPerson).toBe(true);
        // todo - not sure about this b/c the client is sending payment online true
        expect(service.paymentOptions.wixPayOnline).toBe(false);
        expect(service.paymentOptions.custom).toBe(isFree);
        expect(schedule.rate.priceText).toBe(priceText);
      });

      it('pricing plan', async () => {
        const offering = new IndividualOfferingDtoBuilder()
          .withPaymentType(PaymentType.ONLINE)
          .withPricingPlans([])
          .offeredAs([OfferedAsType.PRICING_PLAN])
          .build();

        const service = convertOfferingToService(offering);

        expect(service.paymentOptions.wixPayInPerson).toBe(false);
        expect(service.paymentOptions.wixPayOnline).toBe(false);
        expect(service.paymentOptions.wixPaidPlan).toBe(true);
        expect(service.paymentOptions.custom).toBe(false);
      });
    });

    describe('with info', () => {
      it('description name and tagline', async () => {
        const offeringName = 'offering name';
        const offeringDescription = 'offering description';
        const offeringTagline = 'offering tagline';

        const offering = new IndividualOfferingDtoBuilder()
          .withName(offeringName)
          .withDescription(offeringDescription)
          .withTagline(offeringTagline)
          .build();

        const service = convertOfferingToService(offering);

        expect(service.info.name).toBe(offeringName);
        expect(service.info.description).toBe(offeringDescription);
        expect(service.info.tagLine).toBe(offeringTagline);
      });

      it('category, order', async () => {
        const categoryId = chance.guid();
        const order = chance.integer();

        const offering = new IndividualOfferingDtoBuilder()
          .withCategoryId(categoryId)
          .withOrder(order)
          .build();

        const service = convertOfferingToService(offering);

        expect(service.categoryId).toBe(categoryId);
        expect(service.customProperties.order).toBe(`${order}`);
      });

      it('displayOnlyNoBookFlow, maxParticipantsPerBooking', async () => {
        const maxParticipantsPerBooking = chance.integer();

        const offering = new GroupOfferingDtoBuilder()
          .withMaxParticipantsPerOrder(maxParticipantsPerBooking)
          .asDisplayOnly()
          .build();

        const service = convertOfferingToService(offering);

        expect(service.policy.isBookOnlineAllowed).toBe(false);
        expect(service.policy.maxParticipantsPerBooking).toBe(
          maxParticipantsPerBooking,
        );
      });

      it('cancelRescheduleUpToXMinutesBefore, bookUpToXMinutesBefore', async () => {
        const cancelHours = chance.pickone(['12', '24', '48', '72']);
        const bookHours = chance.pickone(['12', '24', '48', '72']);

        const businessProperties = new Map([
          [
            BookingPolicyProperty.CANCELLATION_LEAD_TIME_AMOUNT_KEY,
            cancelHours,
          ],
          [BookingPolicyProperty.BOOK_LEAD_TIME_AMOUNT_KEY, bookHours],
        ]);

        const offering = new GroupOfferingDtoBuilder().build();

        const service = convertOfferingToService(
          offering,
          null,
          0,
          businessProperties,
        );

        expect(service.policy.cancelRescheduleUpToXMinutesBefore).toBe(
          parseInt(cancelHours, 10) * 60,
        );
        expect(service.policy.bookUpToXMinutesBefore).toBe(
          parseInt(bookHours, 10) * 60,
        );
      });

      it('sets max lead time', async () => {
        const amountOfTimeInMinutes = chance.natural();
        const units = 'days';
        const isEnabled = chance.bool();
        const businessProperties = new Map([
          [
            BookingPolicyProperty.MAX_LEAD_TIME_AMOUNT_KEY,
            amountOfTimeInMinutes,
          ],
          [BookingPolicyProperty.MAX_LEAD_TIME_UNITS_KEY, units],
          [BookingPolicyProperty.MAX_LEAD_TIME_ENABLED_KEY, `${isEnabled}`],
        ]);

        const offering = new GroupOfferingDtoBuilder().build();

        const service: Service = convertOfferingToService(
          offering,
          null,
          0,
          businessProperties,
          experiments,
        );

        expect(service.policy.futureBookingsPolicy).toEqual({
          limitXMinutesToTheFuture: amountOfTimeInMinutes,
          shouldLimit: isEnabled,
        });
      });

      it('sets waitlist settings', async () => {
        const amountOfTimeInMinutes = chance.natural();
        const capacity = chance.natural();
        const units = 'days';
        const isEnabled = chance.bool();
        const businessProperties = new Map([
          [
            BookingPolicyProperty.WAITLIST_WINDOW_AMOUNT_KEY,
            amountOfTimeInMinutes,
          ],
          [BookingPolicyProperty.WAITLIST_CAPACIY, capacity],
          [BookingPolicyProperty.MAX_LEAD_TIME_UNITS_KEY, units],
          [BookingPolicyProperty.WAITLIST_ENABLED_KEY, `${isEnabled}`],
        ]);

        const offering = new GroupOfferingDtoBuilder().build();

        const service: Service = convertOfferingToService(
          offering,
          null,
          0,
          businessProperties,
          experiments,
        );

        expect(service.policy.waitingListPolicy).toEqual({
          timeWindowMinutes: amountOfTimeInMinutes,
          capacity,
          isEnabled,
        });
      });

      it('with images', async () => {
        const image: OfferingImage = {
          fileName: 'fileName',
          height: 1,
          width: 1,
          relativeUri: 'relativeUri',
        };

        const expectedImage = {
          width: image.width,
          height: image.height,
          url: image.relativeUri,
          id: image.fileName,
        };

        const offering = new GroupOfferingDtoBuilder()
          .withImages([image])
          .build();

        const service = convertOfferingToService(offering);

        expect(service.info.images[0]).toEqual(expectedImage);
      });
    });

    describe('with order', () => {
      it('when given', async () => {
        const offering = new IndividualOfferingDtoBuilder().build();
        const order = chance.integer();
        offering.order = order;

        const service = convertOfferingToService(offering);

        expect(service.customProperties.order).toBe(`${order}`);
      });

      it('should create order 0 when not given', async () => {
        const offering = new IndividualOfferingDtoBuilder().build();

        const service = convertOfferingToService(offering);

        expect(service.customProperties.order).toBe(`0`);
      });
    });
  });

  describe('create a service schedule', () => {
    describe('with rate', () => {
      it('with price, minCharge and currency ', async () => {
        const price = chance.integer();
        const currency = chance.currency().code;
        const minCharge = price / 2;
        const offering = new IndividualOfferingDtoBuilder()
          .withPayment({
            currency,
            price,
            minCharge,
          })
          .build();

        const schedule = convertOfferingToSchedule(offering);

        expect(schedule.rate.labeledPriceOptions.general.amount).toBe(
          `${price}`,
        );
        expect(schedule.rate.labeledPriceOptions.general.downPayAmount).toBe(
          `${minCharge}`,
        );
        expect(schedule.rate.labeledPriceOptions.general.currency).toBe(
          `${currency}`,
        );
      });

      it('price is null', async () => {
        const price = null;
        const currency = chance.currency().code;
        const minCharge = null;
        const priceText = chance.sentence();
        const offering = new IndividualOfferingDtoBuilder()
          .withPayment({
            currency,
            price,
            minCharge,
            isFree: true,
            priceText,
          })
          .build();

        const schedule = convertOfferingToSchedule(offering);

        expect(schedule.rate.labeledPriceOptions).toEqual({});
        expect(schedule.rate.priceText).toBe(priceText);
      });
    });

    it('with name, duration, time between', async () => {
      const name = 'offering description';
      const duration = 50;
      const timeBetween = 10;
      const offering = new IndividualOfferingDtoBuilder()
        .withName(name)
        .withDurationInMinutes(duration)
        .withMinutesBetweenAppointments(timeBetween)
        .build();

      const schedule = convertOfferingToSchedule(offering);

      expect(schedule.title).toBe(name);
      expect(schedule.availability.constraints.slotDurations).toEqual([
        duration,
      ]);
      expect(schedule.availability.constraints.timeBetweenSlots).toEqual(
        timeBetween,
      );
    });

    it('with capacity', async () => {
      const capacity = chance.integer();
      const offering = new GroupOfferingDtoBuilder()
        .withCapacity(capacity)
        .build();

      const schedule = convertOfferingToSchedule(
        offering,
        [],
        null,
        null,
        timezone,
      );

      expect(schedule.capacity).toEqual(capacity);
    });

    it('with tags (offering type)', async () => {
      const offering = new IndividualOfferingDtoBuilder().build();

      const schedule = convertOfferingToSchedule(offering);

      expect(schedule.tags).toEqual([offering.type]);
    });

    it('with convert Offering To Update Service Request', () => {
      const offering = new IndividualOfferingDtoBuilder().build();
      const schedule = convertOfferingToSchedule(offering);
      const order = 0;
      const businessProperties = new Map();
      const res = convertOfferingToUpdateServiceRequest(
        offering,
        false,
        [],
        schedule.id,
        order,
        businessProperties,
        timezone,
        experiments,
      );
      const splitInterval = (res.schedules[0] as Schedule).availability
        .constraints.splitInterval;
      expect(splitInterval).toBe(DEFAULT_SPLIT_INTERVAL);
    });

    it('with convert Offering To Update Service Request', () => {
      const offering = new IndividualOfferingDtoBuilder().build();
      const interval = '60';
      const schedule = convertOfferingToSchedule(offering);
      const order = 0;
      const businessProperties = new Map();
      businessProperties.set(
        BookingPolicyProperty.CALENDAR_TIME_INTERVAL_KEY,
        interval,
      );
      const res = convertOfferingToUpdateServiceRequest(
        offering,
        false,
        [],
        schedule.id,
        order,
        businessProperties,
        timezone,
        experiments,
      );
      const splitInterval = (res.schedules[0] as Schedule).availability
        .constraints.splitInterval;
      expect(splitInterval).toBe(parseInt(interval, 10));
    });

    it('with split interval', () => {
      const offering = new IndividualOfferingDtoBuilder().build();
      const splitInterval = chance.pick(['10', '15', '30', '60']);

      const schedule = convertOfferingToSchedule(
        offering,
        [],
        null,
        splitInterval,
      );

      expect(schedule.availability.constraints.splitInterval).toEqual(
        splitInterval,
      );
    });

    it('appointment with staff members linked schedules', async () => {
      const staffId = chance.guid();
      const offering = new IndividualOfferingDtoBuilder()
        .withStaffIds([staffId])
        .build();
      const scheduleId = chance.guid();
      const staffList = [{ id: staffId, schedules: [{ id: scheduleId }] }];

      const schedule = convertOfferingToSchedule(
        offering,
        getLinkedSchedule(staffList),
      );

      expect(schedule.availability.linkedSchedules[0].transparency).toEqual(
        Transparency.BUSY,
      );
      expect(schedule.availability.linkedSchedules[0].scheduleId).toEqual(
        scheduleId,
      );
    });

    it('class with staff members linked schedules', async () => {
      const staffId = chance.guid();
      const offering = new GroupOfferingDtoBuilder()
        .withClassHours(someClassHours([staffId]))
        .build();
      const scheduleId = chance.guid();
      const staffList = [{ id: staffId, schedules: [{ id: scheduleId }] }];

      const schedule = convertOfferingToSchedule(
        offering,
        getLinkedSchedule(staffList, offering.type),
        null,
        null,
        timezone,
      );

      expect(schedule.availability.linkedSchedules).toEqual([]);
      expect(schedule.intervals.length).toEqual(3);
      expect(schedule.intervals[0].affectedSchedules[0].transparency).toEqual(
        Transparency.FREE,
      );
    });

    it('offering is a class', async () => {
      const staffId = chance.guid();
      const workingHours = [
        aWorkingHour(chance.guid(), '12:00', '13:00', staffId),
        aWorkingHour(chance.guid(), '14:00', '15:00', staffId),
      ];
      const offering = new GroupOfferingDtoBuilder()
        .withClassHours(aClassHour(DAYS_OF_WEEK[0], workingHours))
        .build();
      const scheduleId = chance.guid();
      const staffList = [{ id: staffId, schedules: [{ id: scheduleId }] }];

      const schedule = convertOfferingToSchedule(
        offering,
        getLinkedSchedule(staffList),
        null,
        30,
        timezone,
      );

      expect(schedule.availability.start).toEqual(
        moment
          .tz(offering.schedule.startDate, timezone)
          .startOf('day')
          .toISOString(),
      );
      expect(schedule.availability.end).toEqual(
        moment
          .tz(offering.schedule.endDate, timezone)
          .endOf('day')
          .toISOString(),
      );
      expect(schedule.intervals.length).toEqual(workingHours.length);
    });

    it('offering is a course', async () => {
      const staffId = chance.guid();
      const workingHours = [
        aWorkingHour(chance.guid(), '12:00', '13:00', staffId),
        aWorkingHour(chance.guid(), '14:00', '15:00', staffId),
      ];
      const repetition = 3;
      const offering = new CourseOfferingDtoBuilder()
        .withClassHours(aClassHour(DAYS_OF_WEEK[0], workingHours))
        .withWeeksFrequency(repetition)
        .build();
      const scheduleId = chance.guid();
      const staffList = [{ id: staffId, schedules: [{ id: scheduleId }] }];

      const schedule = convertOfferingToSchedule(
        offering,
        getLinkedSchedule(staffList),
        null,
        30,
        timezone,
      );

      expect(schedule.availability.start).toEqual(
        moment
          .tz(offering.schedule.startDate, timezone)
          .startOf('day')
          .toISOString(),
      );
      expect(schedule.availability.end).toEqual(
        moment
          .tz(offering.schedule.endDate, timezone)
          .endOf('day')
          .toISOString(),
      );
      expect(schedule.intervals.length).toEqual(workingHours.length);
      expect(schedule.intervals[0].frequency.repetition).toEqual(repetition);
      expect(schedule.intervals[0].interval.duration).toEqual(60);
    });

    it('offering is a course with edge case timezone', async () => {
      const pacificWallisTimezone = 'Pacific/Wallis';
      const startDate = '2019-08-12';
      const endDate = '2019-08-16';
      const startDateUTC = '2019-08-11T12:00:00.000Z';
      const endDateUTC = '2019-08-16T11:59:59.999Z';
      const staffId = chance.guid();
      const workingHours = [
        aWorkingHour(chance.guid(), '12:00', '13:00', staffId),
        aWorkingHour(chance.guid(), '14:00', '15:00', staffId),
      ];
      const offering = new GroupOfferingDtoBuilder()
        .withClassHours(aClassHour(DAYS_OF_WEEK[0], workingHours))
        .withStartDate(moment(startDate))
        .withEndDate(moment(endDate))
        .build();
      const scheduleId = chance.guid();
      const staffList = [{ id: staffId, schedules: [{ id: scheduleId }] }];

      const schedule = convertOfferingToSchedule(
        offering,
        getLinkedSchedule(staffList),
        null,
        30,
        pacificWallisTimezone,
      );

      expect(schedule.availability.start).toEqual(startDateUTC);
      expect(schedule.availability.end).toEqual(endDateUTC);
    });

    it('offering is a course with edge case timezone', async () => {
      const pacificWallisTimezone = 'Pacific/Wallis';
      const startDate = '2019-08-12';
      const endDate = '2019-08-16';
      const startDateUTC = '2019-08-11T12:00:00.000Z';
      const endDateUTC = '2019-08-16T11:59:59.999Z';
      const staffId = chance.guid();
      const workingHours = [
        aWorkingHour(chance.guid(), '12:00', '13:00', staffId),
        aWorkingHour(chance.guid(), '14:00', '15:00', staffId),
      ];
      const repetition = 3;
      const offering = new CourseOfferingDtoBuilder()
        .withClassHours(aClassHour(DAYS_OF_WEEK[0], workingHours))
        .withWeeksFrequency(repetition)
        .withStartDate(startDate)
        .withEndDate(endDate)
        .build();
      const scheduleId = chance.guid();
      const staffList = [{ id: staffId, schedules: [{ id: scheduleId }] }];

      const schedule = convertOfferingToSchedule(
        offering,
        getLinkedSchedule(staffList),
        null,
        30,
        pacificWallisTimezone,
      );

      expect(schedule.availability.start).toEqual(startDateUTC);
      expect(schedule.availability.end).toEqual(endDateUTC);
    });

    describe('with location', () => {
      it('as My Business Address', () => {
        const locationText = chance.address();
        const locationType: LocationType = LocationTypes.BUSINESS;
        const location = {
          type: locationType,
          locationText,
        };
        const offering = new IndividualOfferingDtoBuilder()
          .withLocation(location)
          .build();

        const service = convertOfferingToSchedule(offering);

        expect(service.location.address).toBe(null);
        expect(service.location.locationType).toEqual(
          ServiceLocationType.OWNER_BUSINESS,
        );
      });

      it("as Customer's Place", () => {
        const locationText = chance.address();
        const locationType: LocationType = LocationTypes.CUSTOMER;
        const location = {
          type: locationType,
          locationText,
        };
        const offering = new IndividualOfferingDtoBuilder()
          .withLocation(location)
          .build();

        const service = convertOfferingToSchedule(offering);

        expect(service.location.address).toEqual(null);
        expect(service.location.locationType).toEqual(
          ServiceLocationType.CUSTOM,
        );
      });

      it('as Other', () => {
        const locationText = chance.address();
        const locationType: LocationType = LocationTypes.OTHER;
        const location = {
          type: locationType,
          locationText,
        };
        const offering = new IndividualOfferingDtoBuilder()
          .withLocation(location)
          .build();

        const service = convertOfferingToSchedule(offering);

        expect(service.location.address).toEqual(locationText);
        expect(service.location.locationType).toEqual(
          ServiceLocationType.OWNER_CUSTOM,
        );
      });
    });

    describe('getStaffByOffering', () => {
      it('appointment', () => {
        const staffMember = {
          id: 'staffId',
          schedules: [{}],
        };
        const offering = new IndividualOfferingDtoBuilder()
          .withStaffIds([staffMember.id])
          .build();
        const staff = getStaffByOffering(
          [staffMember, { id: 'otherStaffId' }],
          offering,
        );

        expect(staff).toEqual([staffMember]);
      });
    });
  });

  describe('create a batch order update', () => {
    it('should create a partial service with order', () => {
      const serviceId = chance.guid();
      const categoryId = chance.guid();
      const order = chance.integer({ min: 1, max: 5 });
      const offering = new IndividualOfferingDtoBuilder()
        .withId(serviceId)
        .withOrder(order)
        .build();

      const service = convertOfferingToOrderedService(offering, categoryId);

      expect(service).toEqual({
        id: serviceId,
        customProperties: { order: `${order}` },
        scheduleIds: [],
        categoryId,
        status: null,
      });
    });
  });

  describe('when Fitness Experiment is off', () => {
    it('doesnt map waiting list and max time before booking', () => {
      experiments = {
        'specs.wos.BookingsFitness': 'false',
      };
      const businessProperties = new Map();

      const offering = new GroupOfferingDtoBuilder().build();

      const service: Service = convertOfferingToService(
        offering,
        null,
        0,
        businessProperties,
        experiments,
      );

      expect(service.policy.waitingListPolicy).toBeUndefined();
      expect(service.policy.futureBookingsPolicy).toBeUndefined();
    });
  });
});
