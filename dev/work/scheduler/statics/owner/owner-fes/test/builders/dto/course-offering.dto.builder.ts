import { Chance } from 'chance';
import {
  OfferingTypes,
  LocationTypes,
  OfferingsConst,
} from '../../../src/dto/offerings/offerings.consts';
import { CourseOfferingDto } from '../../../src/dto/offerings/course-offering.dto';
import {
  PaymentType,
  OfferedAsType,
  DEFAULT_MAX_PARTICIPANTS_PER_ORDER,
} from '../../../src/dto/offerings/offering.dto';
import * as moment from 'moment';

const chance = Chance();
function validCourseOffering(): CourseOfferingDto {
  return {
    id: chance.guid(),
    categoryId: chance.guid(),
    order: 0,
    type: OfferingTypes.COURSE,
    info: {
      name: 'Course on how to play',
      description:
        'A description of a course offering, this is not a course service, its a course OFFERING.',
      images: [
        {
          fileName: 'b6c3ae66437743ef8bf7e67496a46f95.jpg',
          relativeUri: 'b6c3ae66437743ef8bf7e67496a46f95.jpg',
          width: 5312,
          height: 2988,
        },
      ],
      tagLine: 'course tagline',
    },
    location: {
      type: 'BUSINESS',
      locationText: 'Location',
    },
    offeredAs: [],
    pricingPlanInfo: {
      displayText: null,
      pricingPlans: [],
    },
    payment: {
      currency: 'USD',
      price: 10,
      isFree: false,
      priceText: '',
      minCharge: 0,
      paymentType: PaymentType.ONLINE,
    },
    schedulePolicy: {
      maxParticipantsPerOrder: 4,
      displayOnlyNoBookFlow: false,
      isBookable: true,
      uouHidden: false,
      capacity: 10,
    },
    schedule: {
      startDate: moment().format(OfferingsConst.DATE_FORMAT),
      endDate: moment()
        .add(1, 'years')
        .format(OfferingsConst.DATE_FORMAT),
      actualStartDate: moment().format(OfferingsConst.DATE_FORMAT),
      actualEndDate: moment()
        .add(1, 'years')
        .format(OfferingsConst.DATE_FORMAT),
      noEndDate: false,
      repeatEveryXWeeks: 3,
      classHours: {
        sun: null,
        mon: null,
        tue: {
          workingHours: [
            {
              id: chance.guid(),
              workingHour: { startTime: '12:00', endTime: '15:00' },
              staffId: 'staff_id_24',
            },
            {
              id: chance.guid(),
              workingHour: { startTime: '16:00', endTime: '19:00' },
              staffId: 'staff_id_24',
            },
          ],
        },
        wed: null,
        thu: {
          workingHours: [
            {
              id: chance.guid(),
              workingHour: { startTime: '9:00', endTime: '10:00' },
              staffId: 'staff_id_24',
            },
          ],
        },
        fri: null,
        sat: null,
      },
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

function initialCourseOffering(): CourseOfferingDto {
  return {
    id: '',
    categoryId: '',
    order: null,
    type: OfferingTypes.COURSE,
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
    pricingPlanInfo: {
      displayText: null,
      pricingPlans: [],
    },
    schedulePolicy: {
      maxParticipantsPerOrder: DEFAULT_MAX_PARTICIPANTS_PER_ORDER,
      displayOnlyNoBookFlow: false,
      isBookable: true,
      uouHidden: false,
      capacity: null,
    },
    schedule: {
      startDate: moment()
        .add(1, 'months')
        .format(OfferingsConst.DATE_FORMAT),
      endDate: moment()
        .add(2, 'months')
        .format(OfferingsConst.DATE_FORMAT),
      actualStartDate: null,
      actualEndDate: null,
      noEndDate: false,
      repeatEveryXWeeks: 1,
      classHours: {
        mon: null,
        tue: null,
        wed: null,
        thu: null,
        fri: null,
        sat: null,
        sun: null,
      },
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

export class CourseOfferingDtoBuilder {
  courseOffering: CourseOfferingDto = { ...validCourseOffering() };
  initialCourseOffering: CourseOfferingDto = { ...initialCourseOffering() };

  private setOfferedAsType(offeredAs: OfferedAsType) {
    if (this.courseOffering.offeredAs.indexOf(offeredAs) === -1) {
      this.courseOffering.offeredAs.push(offeredAs);
    }
  }

  private setPricingPlanType() {
    this.setOfferedAsType(OfferedAsType.PRICING_PLAN);
  }

  withId(id) {
    this.courseOffering.id = id;
    return this;
  }

  withCategoryId(cid) {
    this.courseOffering.categoryId = cid;
    return this;
  }

  withLocation(location) {
    this.courseOffering.location.type = location.type;
    this.courseOffering.location.locationText = location.locationText;
    return this;
  }

  withPayment(payment) {
    this.courseOffering.payment.currency = payment.currency;
    this.courseOffering.payment.isFree = payment.isFree;
    this.courseOffering.payment.minCharge = payment.minCharge;
    this.courseOffering.payment.price = payment.price;
    this.courseOffering.payment.priceText = payment.priceText;
    this.courseOffering.payment.paymentType = payment.paymentType;
    return this;
  }

  withName(name) {
    this.courseOffering.info.name = name;
    return this;
  }

  withImages(images) {
    this.courseOffering.info.images = images;
    return this;
  }

  withPrice(price) {
    this.courseOffering.payment.price = price;
    return this;
  }

  withPaymentType(paymentType) {
    this.courseOffering.payment.paymentType = paymentType;
    return this;
  }

  withMinCharge(minCharge) {
    this.courseOffering.payment.minCharge = minCharge;
    return this;
  }

  withOrder(order) {
    this.courseOffering.order = order;
    return this;
  }

  withClassHours(classHours) {
    this.courseOffering.schedule.classHours = classHours;
    return this;
  }

  withCapacity(capacity) {
    this.courseOffering.schedulePolicy.capacity = capacity;
    return this;
  }

  asFree() {
    this.courseOffering.payment.isFree = true;
    return this;
  }

  withStartDate(startDate) {
    this.courseOffering.schedule.startDate = startDate;
    return this;
  }

  withEndDate(endDate) {
    this.courseOffering.schedule.endDate = endDate;
    return this;
  }

  withActualStartDate(actualStartDate) {
    this.courseOffering.schedule.actualStartDate = actualStartDate;
    return this;
  }

  withActualEndDate(actualEndDate) {
    this.courseOffering.schedule.actualEndDate = actualEndDate;
    return this;
  }

  withDescription(description) {
    this.courseOffering.info.description = description;
    return this;
  }

  withTagline(tagLine) {
    this.courseOffering.info.tagLine = tagLine;
    return this;
  }

  withMaxParticipantsPerOrder(maxParticipantsPerOrder) {
    this.courseOffering.schedulePolicy.maxParticipantsPerOrder = maxParticipantsPerOrder;
    return this;
  }

  withWeeksFrequency(repeatEveryXWeeks) {
    this.courseOffering.schedule.repeatEveryXWeeks = repeatEveryXWeeks;
    return this;
  }

  withoutClassHours() {
    this.courseOffering.schedule.classHours = {};
    return this;
  }

  notBookable() {
    this.courseOffering.schedulePolicy.isBookable = false;
    return this;
  }

  asDisplayOnly() {
    this.courseOffering.schedulePolicy.displayOnlyNoBookFlow = true;
    this.courseOffering.payment.paymentType = null;
    return this;
  }

  withPricingPlan({
    id = '123',
    name = 'default name',
    status = 'active',
    displayText = 'default display text',
  }) {
    this.courseOffering.pricingPlanInfo = {
      displayText,
      pricingPlans: [
        {
          id,
          name,
          status,
        },
      ],
    };

    this.setPricingPlanType();

    return this;
  }

  withPricingPlanNotAssociated() {
    this.courseOffering.pricingPlanInfo = {
      displayText: 'pp not associated',
      pricingPlans: [],
    };
    this.setPricingPlanType();
    return this;
  }

  build() {
    if (this.courseOffering.offeredAs.length === 0) {
      this.courseOffering.offeredAs = [OfferedAsType.ONE_TIME];
    }

    return this.courseOffering;
  }

  buildInitialCourseOffering() {
    return this.initialCourseOffering;
  }
}
