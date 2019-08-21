import { Chance } from 'chance';
import { GroupOfferingDto } from '../../../src/dto/offerings/group-offering.dto';
import {
  OfferingTypes,
  LocationTypes,
  OfferingsConst,
} from '../../../src/dto/offerings/offerings.consts';
import {
  PaymentType,
  OfferedAsType,
  DEFAULT_MAX_PARTICIPANTS_PER_ORDER,
} from '../../../src/dto/offerings/offering.dto';
import { PricingPlanDto } from '../../../src/dto/pricing-plans/pricing-plan.dto';
import * as moment from 'moment';

const chance = Chance();
export const someClassHours = (
  staffIds = ['staff_id_24', 'staff_id_11', 'staff_id_11'],
) => ({
  sun: null,
  mon: {
    workingHours: [
      {
        id: chance.guid(),
        workingHour: { startTime: '12:00' },
        staffId: staffIds[0],
      },
      {
        id: chance.guid(),
        workingHour: { startTime: '16:00' },
        staffId: staffIds[1] || staffIds[0],
      },
    ],
  },
  tue: null,
  wed: {
    workingHours: [
      {
        id: chance.guid(),
        workingHour: { startTime: '9:00' },
        staffId: staffIds[2] || staffIds[0],
      },
    ],
  },
  thu: null,
  fri: null,
  sat: null,
});

export function aClassHour(day, workingHours) {
  return {
    [day]: {
      workingHours,
    },
  };
}

export function aWorkingHour(id, startTime, endTime, staffId) {
  return {
    id,
    workingHour: { startTime, endTime },
    staffId,
  };
}

function validGroupOffering(): GroupOfferingDto {
  return {
    id: chance.guid(),
    categoryId: chance.guid(),
    order: 0,
    type: OfferingTypes.GROUP,
    info: {
      name: 'Group standing together',
      description:
        'A description of a group offering, this is not a group service, or class, its a group OFFERING.',
      images: [
        {
          fileName: 'b6c3ae66437743ef8bf7e67496a46f95.jpg',
          relativeUri: 'b6c3ae66437743ef8bf7e67496a46f95.jpg',
          width: 5312,
          height: 2988,
        },
      ],
      tagLine: 'group tagline',
    },
    location: {
      type: LocationTypes.BUSINESS,
      locationText: 'Location',
    },
    payment: {
      currency: 'USD',
      price: 10,
      isFree: false,
      priceText: '',
      minCharge: 0,
      paymentType: PaymentType.ONLINE,
    },
    offeredAs: [OfferedAsType.ONE_TIME],
    schedulePolicy: {
      maxParticipantsPerOrder: 4,
      displayOnlyNoBookFlow: false,
      isBookable: true,
      uouHidden: false,
      capacity: 10,
    },
    schedule: {
      repeatEveryXWeeks: 1,
      startDate: moment().format(OfferingsConst.DATE_FORMAT),
      endDate: moment()
        .add(1, 'years')
        .format(OfferingsConst.DATE_FORMAT),
      noEndDate: false,
      durationInMinutes: 10,
      classHours: someClassHours(),
    },
    pricingPlanInfo: {
      displayText: null,
      pricingPlans: [],
    },
    urls: {
      servicePageUrl: {
        base: '',
        path: '',
      },
      bookingPageUrl: {
        base: '',
        path: '',
      },
    },
  };
}

function initialGroupOffering(): GroupOfferingDto {
  return {
    id: '',
    categoryId: '',
    order: null,
    type: OfferingTypes.GROUP,
    info: {
      name: '',
      description: '',
      images: [],
      tagLine: '',
    },
    location: {
      type: LocationTypes.BUSINESS,
      locationText: '',
    },
    payment: {
      currency: 'USD',
      price: null,
      isFree: false,
      priceText: '',
      minCharge: null,
      paymentType: PaymentType.ONLINE,
    },
    offeredAs: [OfferedAsType.ONE_TIME],
    schedulePolicy: {
      maxParticipantsPerOrder: DEFAULT_MAX_PARTICIPANTS_PER_ORDER,
      displayOnlyNoBookFlow: false,
      isBookable: true,
      uouHidden: false,
      capacity: null,
    },
    schedule: {
      repeatEveryXWeeks: 1,
      startDate: moment().format(OfferingsConst.DATE_FORMAT),
      endDate: moment()
        .add(1, 'years')
        .format(OfferingsConst.DATE_FORMAT),
      noEndDate: false,
      durationInMinutes: null,
      classHours: {},
    },
    pricingPlanInfo: {
      displayText: null,
      pricingPlans: [],
    },
    urls: {
      servicePageUrl: {
        base: '',
        path: '',
      },
      bookingPageUrl: {
        base: '',
        path: '',
      },
    },
  };
}

export class GroupOfferingDtoBuilder {
  groupOffering: GroupOfferingDto = { ...validGroupOffering() };

  offeredAs(offeredAs: OfferedAsType[]) {
    this.groupOffering.offeredAs = offeredAs;
    return this;
  }

  withPricingPlans(pricingPlans: PricingPlanDto[]) {
    this.groupOffering.offeredAs = [OfferedAsType.PRICING_PLAN];
    this.groupOffering.pricingPlanInfo.pricingPlans = pricingPlans;
    return this;
  }

  withPricingPlanText(text: string) {
    this.groupOffering.pricingPlanInfo.displayText = text;
    return this;
  }

  withId(id: string) {
    this.groupOffering.id = id;
    return this;
  }

  withCategoryId(cid: string) {
    this.groupOffering.categoryId = cid;
    return this;
  }

  withLocation(location) {
    this.groupOffering.location.type = location.type;
    this.groupOffering.location.locationText = location.locationText;
    return this;
  }

  withPayment(payment) {
    this.groupOffering.payment.currency = payment.currency;
    this.groupOffering.payment.isFree = payment.isFree;
    this.groupOffering.payment.minCharge = payment.minCharge;
    this.groupOffering.payment.price = payment.price;
    this.groupOffering.payment.priceText = payment.priceText;
    this.groupOffering.payment.paymentType = payment.paymentType;
    return this;
  }

  withName(name: string) {
    this.groupOffering.info.name = name;
    return this;
  }

  withImages(images) {
    this.groupOffering.info.images = images;
    return this;
  }

  withPrice(price: number) {
    this.groupOffering.payment.price = price;
    return this;
  }

  withPaymentType(paymentType: PaymentType) {
    this.groupOffering.payment.paymentType = paymentType;
    return this;
  }

  withMinCharge(minCharge: number) {
    this.groupOffering.payment.minCharge = minCharge;
    return this;
  }

  withOrder(order: number) {
    this.groupOffering.order = order;
    return this;
  }

  withClassHours(classHours) {
    this.groupOffering.schedule.classHours = classHours;
    return this;
  }

  withCapacity(capacity: number) {
    this.groupOffering.schedulePolicy.capacity = capacity;
    return this;
  }

  withDurationInMinutes(durationInMinutes: number) {
    this.groupOffering.schedule.durationInMinutes = durationInMinutes;
    return this;
  }

  asFree() {
    this.groupOffering.payment.isFree = true;
    return this;
  }

  withStartDate(startDate: moment.Moment) {
    this.groupOffering.schedule.startDate = startDate.format(
      OfferingsConst.DATE_FORMAT,
    );
    return this;
  }

  withEndDate(endDate: moment.Moment) {
    this.groupOffering.schedule.endDate = endDate.format(
      OfferingsConst.DATE_FORMAT,
    );
    return this;
  }

  withDescription(description: string) {
    this.groupOffering.info.description = description;
    return this;
  }

  withTagline(tagLine: string) {
    this.groupOffering.info.tagLine = tagLine;
    return this;
  }

  withMaxParticipantsPerOrder(maxParticipantsPerOrder: number) {
    this.groupOffering.schedulePolicy.maxParticipantsPerOrder = maxParticipantsPerOrder;
    return this;
  }

  withoutClassHours() {
    this.groupOffering.schedule.classHours = {};
    return this;
  }

  notBookable() {
    this.groupOffering.schedulePolicy.isBookable = false;
    return this;
  }

  withPricingPlan({
    id = '123',
    name = 'default name',
    status = 'active',
    displayText = 'default display text',
  }) {
    this.groupOffering.pricingPlanInfo = {
      displayText,
      pricingPlans: [
        {
          id,
          name,
          status,
        },
      ],
    };
    this.groupOffering.offeredAs = [OfferedAsType.PRICING_PLAN];
    return this;
  }

  withPricingPlanNotAssociated() {
    this.groupOffering.pricingPlanInfo = {
      displayText: 'pp not associated',
      pricingPlans: [],
    };
    this.groupOffering.offeredAs = [OfferedAsType.PRICING_PLAN];
    return this;
  }

  withNoPricingPlan() {
    this.groupOffering.pricingPlanInfo = {
      displayText: null,
      pricingPlans: [],
    };
    this.groupOffering.offeredAs = [OfferedAsType.ONE_TIME];
    return this;
  }

  asDisplayOnly() {
    this.groupOffering.schedulePolicy.displayOnlyNoBookFlow = true;
    this.groupOffering.payment.paymentType = null;
    return this;
  }

  build() {
    return this.groupOffering;
  }

  buildInitialGroupOffering() {
    return { ...initialGroupOffering() };
  }
}
