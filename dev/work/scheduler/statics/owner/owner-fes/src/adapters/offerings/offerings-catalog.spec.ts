import {
  addNewOfferingToPlans,
  createAnOffering,
  deleteAnOffering,
  updateAnOffering,
  updateListOrder,
  updatePlansForOffering,
} from './offerings-catalog';
import { IndividualOfferingDto } from '../../dto/offerings/individual-offering.dto';
import { IndividualOfferingDtoBuilder } from '../../../test/builders/dto/individual-offering.dto.builder';
import * as offeringToServiceMappers from '../mappers/offering/offering-to-service';
import { Chance } from 'chance';
import { CategoryDtoBuilder } from '../../../test/builders/dto/offerings-category.dto.builder';
import {
  Category,
  DeleteServiceRequest,
} from '@wix/ambassador-services-server';
import { OfferedAsType } from '../../dto/offerings/offering.dto';
import { PricingPlanDtoBuilder } from '../../../test/builders/dto/pricing-plan.dto.builder';
import {
  BenefitWithPlanInfo,
  LinkedResource,
  ListResponse,
} from '@wix/ambassador-pricing-plan-benefits-server';

import {
  aBenefit,
  aBenefitWithPlanInfo,
  aBulkDeleteResourcesRequest,
  aLinkedResource,
  aListResponse,
  anAddResourcesRequest,
  aPlanInfo,
} from '@wix/ambassador-pricing-plan-benefits-server/builders';
import { updateACategory } from './category/category';
import { validOfferingsOrder } from '../../../test/builders/dto/offerings-order.dto.builder';
import { CourseOfferingDto } from '../../dto/offerings/course-offering.dto';
import { CourseOfferingDtoBuilder } from '../../../test/builders/dto/course-offering.dto.builder';
import * as moment from 'moment';
import {
  OfferingsConst,
  OfferingTypes,
} from '../../dto/offerings/offerings.consts';
import { BookingPolicyProperty } from '../business/busniess-adapter-rpc';
import { aListResourcesResponse } from '@wix/ambassador-resources-server/builders';
import {
  aCategory,
  aCreateServiceRequest,
  aCreateServiceResponse,
  anUpdateCategoryRequest,
  anUpdateServiceRequest,
  anUpdateServiceResponse,
  aSchedule,
  aService,
} from '@wix/ambassador-services-server/builders';
import { aGetServiceResponse } from '@wix/ambassador-services-catalog-server/builders';
import {
  aGetInfoViewResponse,
  aGetPropertiesResponse,
  aProperty,
} from '@wix/ambassador-business-server/builders';

describe('OfferingsList', () => {
  const chance = new Chance();
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a service', async () => {
    jest.spyOn(offeringToServiceMappers, 'convertOfferingToServiceRequest');

    const offering: IndividualOfferingDto = new IndividualOfferingDtoBuilder().build();
    const allStaffAsResource = aListResourcesResponse().build();
    const splitInterval = chance.pickone(['10', '15', '30']);
    const cancelHours = chance.pickone(['12', '24', '48', '72']);
    const bookHours = chance.pickone(['12', '24', '48', '72']);
    const waitingListAvailable = `${true}`;
    const waitingListCapacity = `${chance.natural()}`;
    const waitingListTimeWindow = `${chance.natural()}`;
    const futureBookingsPolicyShouldLimit = `${true}`;
    const limitXMinutesToTheFuture = `${chance.natural()}`;
    const timezone = chance.timezone().name;
    const getterOfAllStaffAsResource = async () => allStaffAsResource;
    const experiments = {};
    await createAnOffering(
      offering,
      getterOfAllStaffAsResource,
      async () => ({
        services: [],
      }),
      async () =>
        aGetPropertiesResponse()
          .withCustomProperties([
            aProperty()
              .withPropertyName(
                BookingPolicyProperty.CALENDAR_TIME_INTERVAL_KEY,
              )
              .withValue(splitInterval)
              .build(),

            aProperty()
              .withPropertyName(
                BookingPolicyProperty.CANCELLATION_LEAD_TIME_AMOUNT_KEY,
              )
              .withValue(cancelHours)
              .build(),

            aProperty()
              .withPropertyName(BookingPolicyProperty.BOOK_LEAD_TIME_AMOUNT_KEY)
              .withValue(bookHours)
              .build(),
            aProperty()
              .withPropertyName(BookingPolicyProperty.WAITLIST_ENABLED_KEY)
              .withValue(waitingListAvailable)
              .build(),
            aProperty()
              .withPropertyName(BookingPolicyProperty.WAITLIST_CAPACIY)
              .withValue(waitingListCapacity)
              .build(),
            aProperty()
              .withPropertyName(
                BookingPolicyProperty.WAITLIST_WINDOW_AMOUNT_KEY,
              )
              .withValue(waitingListTimeWindow)
              .build(),
            aProperty()
              .withPropertyName(BookingPolicyProperty.MAX_LEAD_TIME_ENABLED_KEY)
              .withValue(futureBookingsPolicyShouldLimit)
              .build(),
            aProperty()
              .withPropertyName(BookingPolicyProperty.MAX_LEAD_TIME_AMOUNT_KEY)
              .withValue(limitXMinutesToTheFuture)
              .build(),
          ])
          .build(),
      async () =>
        aGetInfoViewResponse()
          .withTimeZone(timezone)
          .build(),
      async () => aCreateServiceResponse().build(),
      experiments,
    );

    const businessProperties = new Map([
      [BookingPolicyProperty.CALENDAR_TIME_INTERVAL_KEY, splitInterval],
      [BookingPolicyProperty.CANCELLATION_LEAD_TIME_AMOUNT_KEY, cancelHours],
      [BookingPolicyProperty.BOOK_LEAD_TIME_AMOUNT_KEY, bookHours],
      [BookingPolicyProperty.WAITLIST_CAPACIY, waitingListCapacity],
      [BookingPolicyProperty.WAITLIST_ENABLED_KEY, waitingListAvailable],
      [BookingPolicyProperty.WAITLIST_WINDOW_AMOUNT_KEY, waitingListTimeWindow],
      [
        BookingPolicyProperty.MAX_LEAD_TIME_AMOUNT_KEY,
        limitXMinutesToTheFuture,
      ],
      [
        BookingPolicyProperty.MAX_LEAD_TIME_ENABLED_KEY,
        futureBookingsPolicyShouldLimit,
      ],
    ]);

    expect(
      offeringToServiceMappers.convertOfferingToServiceRequest,
    ).toHaveBeenCalledWith(
      offering,
      allStaffAsResource.resources,
      null,
      0,
      businessProperties,
      timezone,
      experiments,
    );
  });

  it('should duplicate a course or class in the past', async () => {
    let actualStart, actualEnd;
    jest
      .spyOn(offeringToServiceMappers, 'convertOfferingToServiceRequest')
      .mockImplementation((offering, staffList) => {
        actualStart = offering.schedule.startDate;
        actualEnd = offering.schedule.endDate;
        return aCreateServiceRequest().build();
      });

    const pastStartDate = moment()
      .add(-3, 'months')
      .format(OfferingsConst.DATE_FORMAT);

    const pastEndDate = moment()
      .add(-1, 'months')
      .format(OfferingsConst.DATE_FORMAT);

    const pastOffering: CourseOfferingDto = new CourseOfferingDtoBuilder()
      .withStartDate(pastStartDate)
      .withEndDate(pastEndDate)
      .build();

    const allStaffAsResource = aListResourcesResponse().build();
    const getterOfAllStaffAsResource = async () => allStaffAsResource;
    const experiments = {};
    await createAnOffering(
      pastOffering,
      getterOfAllStaffAsResource,
      async () => ({
        services: [],
      }),
      async () => aGetPropertiesResponse().build(),
      async () => aGetInfoViewResponse().build(),
      async () => aCreateServiceResponse().build(),
      experiments,
    );

    const futureStartDate = moment()
      .add(1, 'months')
      .format(OfferingsConst.DATE_FORMAT);

    const futureEndDate = moment()
      .add(2, 'months')
      .format(OfferingsConst.DATE_FORMAT);

    expect(actualStart).toBe(futureStartDate);
    expect(actualEnd).toBe(futureEndDate);
  });

  it('should create a course that starts today ', async () => {
    let actualStart, actualEnd;
    jest
      .spyOn(offeringToServiceMappers, 'convertOfferingToServiceRequest')
      .mockImplementation((offeringToService, staffList) => {
        actualStart = offeringToService.schedule.startDate;
        actualEnd = offeringToService.schedule.endDate;
        return aCreateServiceRequest().build();
      });

    const todayStartDate = moment().format(OfferingsConst.DATE_FORMAT);

    const endDate = moment()
      .add(1, 'months')
      .format(OfferingsConst.DATE_FORMAT);

    const offering: CourseOfferingDto = new CourseOfferingDtoBuilder()
      .withStartDate(todayStartDate)
      .withEndDate(endDate)
      .build();

    const allStaffAsResource = aListResourcesResponse().build();
    const getterOfAllStaffAsResource = async () => allStaffAsResource;
    const experiments = {};

    await createAnOffering(
      offering,
      getterOfAllStaffAsResource,
      async () => ({
        services: [],
      }),
      async () => aGetPropertiesResponse().build(),
      async () => aGetInfoViewResponse().build(),
      async () => aCreateServiceResponse().build(),
      experiments,
    );

    expect(actualStart).toBe(todayStartDate);
    expect(actualEnd).toBe(endDate);
  });

  it('should update a service', async () => {
    jest.spyOn(
      offeringToServiceMappers,
      'convertOfferingToUpdateServiceRequest',
    );
    const scheduleId = chance.guid();
    const order = `${chance.integer({ min: 1, max: 12 })}`;
    const offering: IndividualOfferingDto = new IndividualOfferingDtoBuilder().build();
    const notifyUsers = chance.bool();
    const waitingListAvailable = `${true}`;
    const waitingListCapacity = `${chance.natural()}`;
    const waitingListTimeWindow = `${chance.natural()}`;
    const futureBookingsPolicyShouldLimit = `${true}`;
    const limitXMinutesToTheFuture = `${chance.natural()}`;
    const timezone = chance.timezone().name;
    const allStaffAsResource = aListResourcesResponse().build();
    const getterOfServiceByIdFactory = async id =>
      aGetServiceResponse()
        .withService(
          aService()
            .withScheduleIds([scheduleId])
            .withCustomProperties({ order })
            .build(),
        )
        .withSchedules([
          aSchedule()
            .withId(scheduleId)
            .build(),
        ])
        .build();

    const getterOfAllStaffAsResource = async () => allStaffAsResource;
    const splitInterval = chance.pickone(['10', '15', '60']);
    const cancelHours = chance.pickone(['12', '24', '48', '72']);
    const bookHours = chance.pickone(['12', '24', '48', '72']);
    const experiments = {};

    await updateAnOffering(
      offering,
      notifyUsers ? 'true' : 'false',
      getterOfServiceByIdFactory,
      getterOfAllStaffAsResource,
      async () =>
        aGetPropertiesResponse()
          .withCustomProperties([
            aProperty()
              .withPropertyName(
                BookingPolicyProperty.CALENDAR_TIME_INTERVAL_KEY,
              )
              .withValue(splitInterval)
              .build(),

            aProperty()
              .withPropertyName(
                BookingPolicyProperty.CANCELLATION_LEAD_TIME_AMOUNT_KEY,
              )
              .withValue(cancelHours)
              .build(),

            aProperty()
              .withPropertyName(BookingPolicyProperty.BOOK_LEAD_TIME_AMOUNT_KEY)
              .withValue(bookHours)
              .build(),
            aProperty()
              .withPropertyName(BookingPolicyProperty.WAITLIST_ENABLED_KEY)
              .withValue(waitingListAvailable)
              .build(),
            aProperty()
              .withPropertyName(BookingPolicyProperty.WAITLIST_CAPACIY)
              .withValue(waitingListCapacity)
              .build(),
            aProperty()
              .withPropertyName(
                BookingPolicyProperty.WAITLIST_WINDOW_AMOUNT_KEY,
              )
              .withValue(waitingListTimeWindow)
              .build(),
            aProperty()
              .withPropertyName(BookingPolicyProperty.MAX_LEAD_TIME_ENABLED_KEY)
              .withValue(futureBookingsPolicyShouldLimit)
              .build(),
            aProperty()
              .withPropertyName(BookingPolicyProperty.MAX_LEAD_TIME_AMOUNT_KEY)
              .withValue(limitXMinutesToTheFuture)
              .build(),
          ])
          .build(),
      async () =>
        aGetInfoViewResponse()
          .withTimeZone(timezone)
          .build(),
      async () => anUpdateServiceResponse().build(),
      experiments,
    );

    const businessProperties = new Map([
      [BookingPolicyProperty.CALENDAR_TIME_INTERVAL_KEY, splitInterval],
      [BookingPolicyProperty.CANCELLATION_LEAD_TIME_AMOUNT_KEY, cancelHours],
      [BookingPolicyProperty.BOOK_LEAD_TIME_AMOUNT_KEY, bookHours],
      [BookingPolicyProperty.WAITLIST_CAPACIY, waitingListCapacity],
      [BookingPolicyProperty.WAITLIST_ENABLED_KEY, waitingListAvailable],
      [BookingPolicyProperty.WAITLIST_WINDOW_AMOUNT_KEY, waitingListTimeWindow],
      [
        BookingPolicyProperty.MAX_LEAD_TIME_AMOUNT_KEY,
        limitXMinutesToTheFuture,
      ],
      [
        BookingPolicyProperty.MAX_LEAD_TIME_ENABLED_KEY,
        futureBookingsPolicyShouldLimit,
      ],
    ]);

    expect(
      offeringToServiceMappers.convertOfferingToUpdateServiceRequest,
    ).toHaveBeenCalledWith(
      offering,
      notifyUsers,
      allStaffAsResource.resources,
      scheduleId,
      +order,
      businessProperties,
      timezone,
      experiments,
    );
  });

  it('should remove payment when updating a service to only pricing plan', async () => {
    let actualOffering;

    jest
      .spyOn(offeringToServiceMappers, 'convertOfferingToUpdateServiceRequest')
      .mockImplementation((offeringForRequest, staffList) => {
        actualOffering = offeringForRequest;
        return anUpdateServiceRequest().build();
      });

    const scheduleId = chance.guid();
    const offering: IndividualOfferingDto = new IndividualOfferingDtoBuilder()
      .withPricingPlans([])
      .withPayment({
        price: chance.integer({ min: 5, max: 10 }),
        minCharge: chance.integer({ min: 0, max: 5 }),
      })
      .build();

    const allStaffAsResource = aListResourcesResponse().build();
    const getterOfServiceByIdFactory = async id =>
      aGetServiceResponse()
        .withService(
          aService()
            .withScheduleIds([scheduleId])
            .build(),
        )
        .withSchedules([
          aSchedule()
            .withId(scheduleId)
            .build(),
        ])
        .build();

    const getterOfAllStaffAsResource = async () => allStaffAsResource;
    const experiments = {};

    await updateAnOffering(
      offering,
      'false',
      getterOfServiceByIdFactory,
      getterOfAllStaffAsResource,
      async () => aGetPropertiesResponse().build(),
      async () => aGetInfoViewResponse().build(),
      async () => anUpdateServiceResponse().build(),
      experiments,
    );

    expect(actualOffering.payment.price).toBeNull();
    expect(actualOffering.payment.minCharge).toBeNull();
  });

  it('should update a category', async () => {
    const categoryId = chance.guid();
    const someName = chance.word();
    const categoryUpdater = jest.fn();
    const order = chance.integer({ min: 0, max: 10 });
    const someCategoryDto = new CategoryDtoBuilder()
      .withId(categoryId)
      .withName(someName)
      .withOrder(order)
      .build();
    const someCategory: Category = aCategory()
      .withStatus(null)
      .withName(someName)
      .withId(categoryId)
      .withCustomProperties({ order: order.toString() })
      .build();

    await updateACategory(categoryUpdater, someCategoryDto);

    expect(categoryUpdater).toHaveBeenCalledWith(
      anUpdateCategoryRequest()
        .withCategory(someCategory)
        .build(),
    );
  });

  it('should remove offering from all plans if priced and single session only', async () => {
    const offering: IndividualOfferingDto = new IndividualOfferingDtoBuilder()
      .offeredAs([OfferedAsType.ONE_TIME])
      .build();
    const deleterOfServiceFromPlans = jest.fn();

    await updatePlansForOffering(
      offering,
      jest.fn(),
      jest.fn(),
      jest.fn(),
      deleterOfServiceFromPlans,
      jest.fn(),
    );

    expect(deleterOfServiceFromPlans).toHaveBeenCalledWith(offering.id);
  });

  it('should remove offering from all plans if no benefits listed', async () => {
    const existingPlan = chance.guid();
    const offering: IndividualOfferingDto = new IndividualOfferingDtoBuilder()
      .offeredAs([OfferedAsType.ONE_TIME, OfferedAsType.PRICING_PLAN])
      .withPricingPlans([])
      .build();
    const adderOfServiceToPlans = jest.fn();
    const deleterOfServiceFromPlans = jest.fn();
    const bulkDeleterOfServiceFromPlans = jest.fn();
    const getterOfBenefitList = jest.fn();

    await updatePlansForOffering(
      offering,
      getterOfBenefitList,
      getterOfBenefitList,
      adderOfServiceToPlans,
      deleterOfServiceFromPlans,
      bulkDeleterOfServiceFromPlans,
    );

    expect(deleterOfServiceFromPlans).toHaveBeenCalledWith(offering.id);
    expect(bulkDeleterOfServiceFromPlans).not.toHaveBeenCalled();
    expect(adderOfServiceToPlans).not.toHaveBeenCalled();
    expect(getterOfBenefitList).not.toHaveBeenCalled();
  });

  it('should add offering to newly added plans', async () => {
    const newPlan = 'newPlan1';
    const offering: IndividualOfferingDto = new IndividualOfferingDtoBuilder()
      .offeredAs([OfferedAsType.ONE_TIME, OfferedAsType.PRICING_PLAN])
      .withPricingPlans([new PricingPlanDtoBuilder().withId(newPlan).build()])
      .build();

    const adderOfServiceToPlans = jest.fn();

    await updatePlansForOffering(
      offering,
      getterOfBenefitsByPlansMock,
      getterOfBenefitListByOfferingIdFactory([]),
      adderOfServiceToPlans,
      jest.fn(),
      jest.fn(),
    );

    expect(adderOfServiceToPlans).toHaveBeenCalledWith(
      anAddResourcesRequest()
        .withResources([planIdToLinkedResource(newPlan, offering.id)])
        .build(),
    );
  });

  it('should not add offering to plans that already include it', async () => {
    const newPlan = 'newPlan1';
    const existingPlan = chance.guid();
    const offering: IndividualOfferingDto = new IndividualOfferingDtoBuilder()
      .offeredAs([OfferedAsType.ONE_TIME, OfferedAsType.PRICING_PLAN])
      .withPricingPlans([
        new PricingPlanDtoBuilder().withId(newPlan).build(),
        new PricingPlanDtoBuilder().withId(existingPlan).build(),
      ])
      .build();

    const deleterOfServiceFromPlans = jest.fn();
    const bulkDeleterOfServiceFromPlans = jest.fn();
    const adderOfServiceToPlans = jest.fn();

    await updatePlansForOffering(
      offering,
      getterOfBenefitsByPlansMock,
      getterOfBenefitListByOfferingIdFactory([existingPlan]),
      adderOfServiceToPlans,
      deleterOfServiceFromPlans,
      bulkDeleterOfServiceFromPlans,
    );

    expect(adderOfServiceToPlans).toHaveBeenCalledWith(
      anAddResourcesRequest()
        .withResources([planIdToLinkedResource(newPlan, offering.id)])
        .build(),
    );

    expect(deleterOfServiceFromPlans).not.toHaveBeenCalled();
    expect(bulkDeleterOfServiceFromPlans).not.toHaveBeenCalled();
  });

  it('should remove offering from plans that no longer include it', async () => {
    const newPlan = 'newPlan1';
    const existingPlan = chance.guid();
    const removedPlan = 'removedPlan';
    const offering: IndividualOfferingDto = new IndividualOfferingDtoBuilder()
      .offeredAs([OfferedAsType.ONE_TIME, OfferedAsType.PRICING_PLAN])
      .withPricingPlans([
        new PricingPlanDtoBuilder().withId(newPlan).build(),
        new PricingPlanDtoBuilder().withId(existingPlan).build(),
      ])
      .build();

    const bulkDeleterOfServiceFromPlans = jest.fn();
    const adderOfServiceToPlans = jest.fn();

    await updatePlansForOffering(
      offering,
      getterOfBenefitsByPlansMock,
      getterOfBenefitListByOfferingIdFactory([removedPlan, existingPlan]),
      adderOfServiceToPlans,
      jest.fn(),
      bulkDeleterOfServiceFromPlans,
    );

    expect(adderOfServiceToPlans).toHaveBeenCalledWith(
      anAddResourcesRequest()
        .withResources([planIdToLinkedResource(newPlan, offering.id)])
        .build(),
    );

    expect(bulkDeleterOfServiceFromPlans).toHaveBeenCalledWith(
      aBulkDeleteResourcesRequest()
        .withResources([planIdToLinkedResource(removedPlan, offering.id)])
        .build(),
    );
  });

  it('should not add offering to plans if none were added', async () => {
    const existingPlan = chance.guid();
    const removedPlan = 'removedPlan';
    const offering: IndividualOfferingDto = new IndividualOfferingDtoBuilder()
      .offeredAs([OfferedAsType.ONE_TIME, OfferedAsType.PRICING_PLAN])
      .withPricingPlans([
        new PricingPlanDtoBuilder().withId(existingPlan).build(),
      ])
      .build();

    const deleterOfServiceFromPlans = jest.fn();
    const bulkDeleterOfServiceFromPlans = jest.fn();
    const adderOfServiceToPlans = jest.fn();

    await updatePlansForOffering(
      offering,
      getterOfBenefitsByPlansMock,
      getterOfBenefitListByOfferingIdFactory([removedPlan, existingPlan]),
      adderOfServiceToPlans,
      deleterOfServiceFromPlans,
      bulkDeleterOfServiceFromPlans,
    );

    expect(adderOfServiceToPlans).not.toHaveBeenCalled();
    expect(deleterOfServiceFromPlans).not.toHaveBeenCalled();

    expect(bulkDeleterOfServiceFromPlans).toHaveBeenCalledWith(
      aBulkDeleteResourcesRequest()
        .withResources([planIdToLinkedResource(removedPlan, offering.id)])
        .build(),
    );
  });

  it('should do very little if nothing has changed', async () => {
    const existingPlan = chance.guid();
    const offering: IndividualOfferingDto = new IndividualOfferingDtoBuilder()
      .offeredAs([OfferedAsType.ONE_TIME, OfferedAsType.PRICING_PLAN])
      .withPricingPlans([
        new PricingPlanDtoBuilder().withId(existingPlan).build(),
      ])
      .build();

    const deleterOfServiceFromPlans = jest.fn();
    const bulkDeleterOfServiceFromPlans = jest.fn();
    const adderOfServiceToPlans = jest.fn();

    await updatePlansForOffering(
      offering,
      getterOfBenefitsByPlansMock,
      getterOfBenefitListByOfferingIdFactory([existingPlan]),
      adderOfServiceToPlans,
      deleterOfServiceFromPlans,
      bulkDeleterOfServiceFromPlans,
    );

    expect(adderOfServiceToPlans).not.toHaveBeenCalled();
    expect(deleterOfServiceFromPlans).not.toHaveBeenCalled();
    expect(bulkDeleterOfServiceFromPlans).not.toHaveBeenCalled();
  });

  it('should add offering to plans if created with plans', async () => {
    const planId = chance.guid();
    const offering: IndividualOfferingDto = new IndividualOfferingDtoBuilder()
      .offeredAs([OfferedAsType.PRICING_PLAN, OfferedAsType.ONE_TIME])
      .withPricingPlans([new PricingPlanDtoBuilder().withId(planId).build()])
      .build();

    const adderOfServiceToPlans = jest.fn();

    await addNewOfferingToPlans(
      offering,
      getterOfBenefitsByPlansMock,
      adderOfServiceToPlans,
    );

    expect(adderOfServiceToPlans).toHaveBeenCalledWith(
      anAddResourcesRequest()
        .withResources([planIdToLinkedResource(planId, offering.id)])
        .build(),
    );
  });

  it('should not add offering to plans if priced as single session', async () => {
    const planId = chance.guid();
    const offering: IndividualOfferingDto = new IndividualOfferingDtoBuilder()
      .withPricingPlans([new PricingPlanDtoBuilder().withId(planId).build()])
      .offeredAs([OfferedAsType.ONE_TIME])
      .build();

    const adderOfServiceToPlans = jest.fn();

    await addNewOfferingToPlans(
      offering,
      getterOfBenefitsByPlansMock,
      adderOfServiceToPlans,
    );

    expect(adderOfServiceToPlans).not.toHaveBeenCalled();
  });

  it('should not add offering to plans if created without plans', async () => {
    const offering: IndividualOfferingDto = new IndividualOfferingDtoBuilder()
      .offeredAs([OfferedAsType.PRICING_PLAN, OfferedAsType.ONE_TIME])
      .withPricingPlans([])
      .build();

    const adderOfServiceToPlans = jest.fn();

    await addNewOfferingToPlans(
      offering,
      getterOfBenefitsByPlansMock,
      adderOfServiceToPlans,
    );

    expect(adderOfServiceToPlans).not.toHaveBeenCalled();
  });

  describe('offering and categories order', () => {
    it('should reorder the offering and categories', async () => {
      const newOrder = validOfferingsOrder();
      const mockOfOrderServices = jest.fn().mockResolvedValue({});
      const mockOfOrderCategorise = jest.fn().mockResolvedValue({});

      await updateListOrder(
        newOrder.categories,
        mockOfOrderServices,
        mockOfOrderCategorise,
      );
      const orderServicesRequest = mockOfOrderServices.mock.calls[0][0];
      const orderCategoriseRequest = mockOfOrderCategorise.mock.calls[0][0];
      expect(orderServicesRequest[0].id).toBe(
        newOrder.categories[0].offerings[0].id,
      );
      expect(orderCategoriseRequest[0].id).toBe(newOrder.categories[0].id);
    });
    it('should change category id', async () => {
      const newOrder = validOfferingsOrder();
      const mockOfOrderServices = jest.fn().mockResolvedValue({});
      const mockOfOrderCategorise = jest.fn().mockResolvedValue({});

      await updateListOrder(
        newOrder.categories,
        mockOfOrderServices,
        mockOfOrderCategorise,
      );
      const orderServicesRequest = mockOfOrderServices.mock.calls[0][0];
      expect(orderServicesRequest[0].categoryId).toBe(
        newOrder.categories[0].id,
      );
    });
  });

  it('should preserve future bookings when deleting a 1on1 service', async () => {
    const offeringId = chance.guid();
    const deleterOfOffering = jest.fn();
    const getterOfServiceById = () =>
      Promise.resolve(
        aGetServiceResponse()
          .withService(
            aService()
              .withId(offeringId)
              .build(),
          )
          .withSchedules([
            aSchedule()
              .withTags([OfferingTypes.INDIVIDUAL])
              .build(),
          ])
          .build(),
      );
    const expectedDeleteRequest: DeleteServiceRequest = {
      notifyParticipants: false,
      preserveFutureSessionsWithParticipants: true,
      id: offeringId,
    };

    await deleteAnOffering(
      deleterOfOffering,
      getterOfServiceById,
      offeringId,
      false,
    );

    expect(deleterOfOffering).toHaveBeenCalledWith(expectedDeleteRequest);
  });

  it('should not preserve future bookings when deleting a class', async () => {
    const offeringId = chance.guid();
    const deleterOfOffering = jest.fn();
    const getterOfServiceById = () =>
      Promise.resolve(
        aGetServiceResponse()
          .withService(
            aService()
              .withId(offeringId)
              .build(),
          )
          .withSchedules([
            aSchedule()
              .withTags([OfferingTypes.GROUP])
              .build(),
          ])
          .build(),
      );
    const expectedDeleteRequest: DeleteServiceRequest = {
      notifyParticipants: false,
      preserveFutureSessionsWithParticipants: false,
      id: offeringId,
    };

    await deleteAnOffering(
      deleterOfOffering,
      getterOfServiceById,
      offeringId,
      false,
    );

    expect(deleterOfOffering).toHaveBeenCalledWith(expectedDeleteRequest);
  });

  it('should not preserve future bookings when deleting a course', async () => {
    const offeringId = chance.guid();
    const deleterOfOffering = jest.fn();
    const getterOfServiceById = () =>
      Promise.resolve(
        aGetServiceResponse()
          .withService(
            aService()
              .withId(offeringId)
              .build(),
          )
          .withSchedules([
            aSchedule()
              .withTags([OfferingTypes.COURSE])
              .build(),
          ])
          .build(),
      );
    const expectedDeleteRequest: DeleteServiceRequest = {
      notifyParticipants: false,
      preserveFutureSessionsWithParticipants: false,
      id: offeringId,
    };

    await deleteAnOffering(
      deleterOfOffering,
      getterOfServiceById,
      offeringId,
      false,
    );

    expect(deleterOfOffering).toHaveBeenCalledWith(expectedDeleteRequest);
  });
});

function mapPlanToMockBenefit(planId: string): string {
  return `${planId}-benefit`;
}

function planToBenfitWithPlanInfo(planId: string): BenefitWithPlanInfo {
  return aBenefitWithPlanInfo()
    .withBenefit(
      aBenefit()
        .withId(mapPlanToMockBenefit(planId))
        .build(),
    )
    .withPlanInfo(
      aPlanInfo()
        .withId(planId)
        .build(),
    )
    .build();
}

function getterOfBenefitListByOfferingIdFactory(
  existingPlanIds: string[],
): (ListRequest) => Promise<ListResponse> {
  return async (offeringId: string): Promise<ListResponse> => {
    const benefitsToReturn = existingPlanIds.map(planToBenfitWithPlanInfo);
    return aListResponse()
      .withBenefitsWithPlanInfo(benefitsToReturn)
      .build();
  };
}

async function getterOfBenefitsByPlansMock(
  planIds: string[],
): Promise<ListResponse> {
  const benefitsToReturn = planIds.map(planToBenfitWithPlanInfo);

  return aListResponse()
    .withBenefitsWithPlanInfo(benefitsToReturn)
    .build();
}

function planIdToLinkedResource(
  planId: string,
  offeringId: string,
): LinkedResource {
  return aLinkedResource()
    .withPlanId(planId)
    .withBenefitId(mapPlanToMockBenefit(planId))
    .withResourceId(offeringId)
    .build();
}
