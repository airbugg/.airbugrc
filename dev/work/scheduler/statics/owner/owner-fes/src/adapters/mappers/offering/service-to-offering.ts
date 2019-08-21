import {
  PaymentOptions,
  GetServiceResponse,
  Category,
  Schedule,
  Service,
  PricingPlan,
  Resource,
  URLs,
} from '@wix/ambassador-services-catalog-server/rpc';
import {
  OfferingTypes,
  LocationTypes,
  LABELED_PRICE,
} from '../../../dto/offerings/offerings.consts';
import {
  IndividualOfferingDto,
  IndividualSchedule,
} from '../../../dto/offerings/individual-offering.dto';
import {
  GroupOfferingDto,
  GroupSchedule,
} from '../../../dto/offerings/group-offering.dto';
import {
  CourseOfferingDto,
  CourseSchedule,
} from '../../../dto/offerings/course-offering.dto';
import {
  PaymentType,
  OfferedAsType,
  OfferingCategory,
  URLDto,
} from '../../../dto/offerings/offering.dto';
import { ServiceLocationType, DEFAULT_CURRENCY } from '../../consts';
import { mapOfferingImage } from '../image/platfrom-image-to-web-image-mapper';
import { scheduleToWhoWorkings } from '../../scheduler-to-whos-working';
import { convertRecurringIntervalsToClassHours } from './class-hours/reccuring-intervals-to-class-hours';
import * as moment from 'moment';

export const mapPaymentOptionsToPaymentType = (
  paymentOptions: PaymentOptions,
) => {
  if (paymentOptions.custom) {
    return PaymentType.OFFLINE;
  }

  if (paymentOptions.wixPayOnline && !paymentOptions.wixPayInPerson) {
    return PaymentType.ONLINE;
  }
  if (!paymentOptions.wixPayOnline && paymentOptions.wixPayInPerson) {
    return PaymentType.OFFLINE;
  }
  return PaymentType.ALL;
};

function hasPrice(rate) {
  return (
    rate &&
    rate.labeledPriceOptions &&
    rate.labeledPriceOptions[LABELED_PRICE] &&
    rate.labeledPriceOptions[LABELED_PRICE].amount
  );
}

export const getOfferedAs = (pricingPlans, rate, paymentOptions) => {
  const offeredAs = [];

  const hasPricingPlans = pricingPlans && pricingPlans.length > 0;
  const hasPricingPlanIntent = hasAPricingPlanIntent(paymentOptions);

  if (hasPricingPlans || hasPricingPlanIntent) {
    offeredAs.push(OfferedAsType.PRICING_PLAN);
  }

  if (hasPrice(rate) || isFreeService(paymentOptions)) {
    offeredAs.push(OfferedAsType.ONE_TIME);
  }

  return offeredAs;
};

function hasAPricingPlanIntent(paymentOptions: PaymentOptions) {
  return paymentOptions && !!paymentOptions.wixPaidPlan;
}

function isFreeService(paymentOptions: PaymentOptions) {
  return paymentOptions && paymentOptions.custom;
}

function getPricingPlansInfo(
  pricingPlans: PricingPlan[],
  paymentOptions,
  priceText,
) {
  let displayText = '';
  if (hasAPricingPlanIntent(paymentOptions)) {
    displayText = priceText;
  }

  return {
    displayText,
    pricingPlans: !pricingPlans
      ? []
      : pricingPlans.map(plan => ({
          id: plan.id,
          name: plan.name,
          status: null,
        })),
  };
}

export const convertServiceToOffering = (
  { service, resources, pricingPlans, schedules, urls }: GetServiceResponse,
  businessSchedule: Schedule,
): IndividualOfferingDto | GroupOfferingDto | CourseOfferingDto => {
  const availability = getValidProperty(schedules, 'availability');
  const minutesBetweenAppointments =
    availability &&
    availability.constraints &&
    availability.constraints.timeBetweenSlots
      ? availability.constraints.timeBetweenSlots
      : 0;

  const offering = {
    id: service.id,
    categoryId: service.categoryId,
    order: service.customProperties
      ? Number(service.customProperties.order)
      : 0,
    type: getOfferingTypeFromSchedules(schedules),
    // urlName: 'studio-yoga-1',
    info: {
      name: service.info.name,
      description: service.info.description,
      images: !service.info.images
        ? []
        : service.info.images.map(mapOfferingImage),
      tagLine: service.info.tagLine,
    },
    location: getLocation(schedules),
    payment: getPayment(service, schedules),
    offeredAs: getOfferedAs(
      pricingPlans,
      getValidProperty(schedules, 'rate'),
      service.paymentOptions,
    ),
    pricingPlanInfo: getPricingPlansInfo(
      pricingPlans,
      service.paymentOptions,
      getPriceText(schedules),
    ),
    schedulePolicy: {
      maxParticipantsPerOrder: service.policy.maxParticipantsPerBooking,
      capacity: getValidProperty(schedules, 'capacity'),
      minutesBetweenAppointments,
      staffMembersIds: resources.map(({ id }) => id),
      uouHidden: service.customProperties.uouHidden === 'true',
      isBookable: getIsBookable(schedules), //todo
      displayOnlyNoBookFlow: !service.policy.isBookOnlineAllowed,
    },
    schedule: null,
    urls: getUrls(urls),
  };

  // hack to fool typescript..
  offering.schedule = getOfferingSchedule(
    schedules,
    resources,
    businessSchedule,
  );

  return offering;
};

function getIsBookable(schedules: Schedule[]): boolean {
  if (
    !schedules ||
    !schedules[0] ||
    !schedules[0].availability ||
    !schedules[0].tags
  ) {
    return false;
  }

  const availability = schedules[0].availability;

  //  class that ended or course that started
  if (
    moment(availability.end).isBefore(moment()) ||
    (schedules[0].tags.includes(OfferingTypes.COURSE) &&
      moment(availability.start).isBefore(moment()))
  ) {
    return false;
  }

  return true;
}

function getUrls(
  urls: URLs,
): { bookingPageUrl: URLDto; servicePageUrl: URLDto } {
  return urls
    ? {
        ...(urls.bookingPageUrl && {
          bookingPageUrl: {
            base: urls.bookingPageUrl.base,
            path: urls.bookingPageUrl.path,
          },
        }),
        ...(urls.servicePageUrl && {
          servicePageUrl: {
            base: urls.servicePageUrl.base,
            path: urls.servicePageUrl.path,
          },
        }),
      }
    : null;
}

function getPriceText(schedules) {
  const rate = getValidProperty(schedules, 'rate');
  return rate ? rate.priceText : null;
}

function getValidProperty(array: any[], property) {
  return array && array[0] ? array[0][property] : null;
}

function getLocation(schedules: Schedule[]) {
  let serviceLocationType = null;
  let locationText = null;
  if (schedules && schedules[0] && schedules[0].location) {
    serviceLocationType = schedules[0].location.locationType;
  }

  let type = LocationTypes.BUSINESS;

  switch (serviceLocationType) {
    case ServiceLocationType.CUSTOM:
      type = LocationTypes.CUSTOMER;
      break;
    case ServiceLocationType.OWNER_CUSTOM:
      type = LocationTypes.OTHER;
      locationText = schedules[0].location.address;
      break;
    case ServiceLocationType.OWNER_BUSINESS:
    default:
      type = LocationTypes.BUSINESS;
  }
  return {
    type,
    locationText,
  };
}

function getPayment(service: Service, schedules: Schedule[]) {
  let price = null;
  let currency = DEFAULT_CURRENCY; // yes this sucks but it's how the owner expects it..
  let minCharge = null;

  const rate = schedules && schedules[0] && schedules[0].rate;
  const priceText = rate ? rate.priceText : null;

  if (rate && rate.labeledPriceOptions && rate.labeledPriceOptions.general) {
    const generalPayment = rate.labeledPriceOptions.general;
    price = +generalPayment.amount;
    currency = generalPayment.currency;
    minCharge = +generalPayment.downPayAmount;
  }

  return {
    currency,
    price: service.paymentOptions.custom ? 0 : price,
    paymentType: mapPaymentOptionsToPaymentType(service.paymentOptions),
    isFree: service.paymentOptions.custom,
    priceText,
    minCharge,
  };
}

export function getOfferingTypeFromSchedules(
  schedules: Schedule[],
): OfferingTypes {
  if (!schedules || !schedules[0]) {
    return OfferingTypes.INDIVIDUAL;
  }

  const types = [
    OfferingTypes.COURSE,
    OfferingTypes.GROUP,
    OfferingTypes.INDIVIDUAL,
  ];

  const typeTags = types.filter(type => schedules[0].tags.includes(type));

  return typeTags[0];
}

const getTimeAsString = (availability, when) => {
  return availability && availability[when]
    ? availability[when].slice(0, 10)
    : null;
};

function getIndividualSchedule(
  schedule: Schedule,
  resources,
  businessSchedule: Schedule,
): IndividualSchedule {
  const durationInMinutes = getSlotsDuration(schedule);
  // individual
  // schedule: {
  //   startDate: number;
  //   endDate: number;
  //   noEndDate: boolean;
  //   durationInMinutes: number;
  //   staffAvailability?: WorkingDay[];
  // };

  return {
    startDate: null,
    endDate: null,
    noEndDate: false, //todo
    durationInMinutes,
    staffAvailability: getStaffAvailability(
      schedule,
      resources,
      businessSchedule,
      durationInMinutes,
    ),
  };
}

function getGroupSchedule(schedule: Schedule): GroupSchedule {
  // group
  // schedule: {
  //   startDate: string;
  //   endDate: string;
  //   noEndDate: boolean;
  //   durationInMinutes: number;
  //   repeatEveryXWeeks: number;
  //   classHours: Days;
  // };
  const interval = getValidProperty(schedule.intervals, 'interval');
  const durationInMinutes = interval ? interval.duration : null;

  return {
    startDate: getTimeAsString(schedule.availability, 'start'), //todo
    endDate: getTimeAsString(schedule.availability, 'end'), //todo
    noEndDate: false, //todo
    durationInMinutes,
    repeatEveryXWeeks: 1,
    classHours: convertRecurringIntervalsToClassHours(schedule.intervals),
  };
}

function getCourseSchedule(schedule: Schedule): CourseSchedule {
  // course
  // schedule: {
  //   startDate: string;
  //   endDate: string;
  //   actualStartDate: string;
  //   actualEndDate: string;
  //   noEndDate: boolean;
  //   repeatEveryXWeeks: number;
  //   classHours: Days;
  // };

  let repeatEveryXWeeks = getValidProperty(schedule.intervals, 'frequency');
  repeatEveryXWeeks = repeatEveryXWeeks ? repeatEveryXWeeks.repetition : 1;

  return {
    startDate: getTimeAsString(schedule.availability, 'start'), //todo
    endDate: getTimeAsString(schedule.availability, 'end'), //todo
    actualStartDate: getTimeAsString(schedule.availability, 'start'), //todo
    actualEndDate: getTimeAsString(schedule.availability, 'end'), //todo
    noEndDate: false, //todo
    repeatEveryXWeeks,
    classHours: convertRecurringIntervalsToClassHours(schedule.intervals),
  };
}

export const getOfferingSchedule = (
  schedules: Schedule[],
  resources: Resource[],
  businessSchedule: Schedule,
): IndividualSchedule | GroupSchedule | CourseSchedule => {
  if (!schedules || schedules.length === 0) {
    return null;
  }

  const offeringType = getOfferingTypeFromSchedules(schedules);

  switch (offeringType) {
    case OfferingTypes.GROUP:
      return getGroupSchedule(schedules[0]);
    case OfferingTypes.COURSE:
      return getCourseSchedule(schedules[0]);
    case OfferingTypes.INDIVIDUAL:
    default:
      return getIndividualSchedule(schedules[0], resources, businessSchedule);
  }
};

function getStaffAvailability(
  schedule: Schedule,
  resources: Resource[],
  businessSchedule: Schedule,
  durationInMinutes,
) {
  const schedules = resources.map(
    (resource: Resource) => resource.schedules[0],
  );
  if (getOfferingsType(schedule) === OfferingTypes.INDIVIDUAL) {
    try {
      return scheduleToWhoWorkings(
        schedules,
        businessSchedule,
        durationInMinutes,
        resources,
      );
    } catch (e) {
      console.error(
        'Error in formatting schedule to who`s workings::',
        JSON.stringify(schedule),
        e,
      );
    }
  }
  return null;
}

function getOfferingsType(schedule: Schedule): OfferingTypes {
  if (schedule.tags.includes('INDIVIDUAL')) {
    return OfferingTypes.INDIVIDUAL;
  }
  if (schedule.tags.includes('GROUP')) {
    return OfferingTypes.GROUP;
  }
  if (schedule.tags.includes('COURSE')) {
    return OfferingTypes.COURSE;
  }
  return null;
}

function getSlotsDuration(schedule) {
  return schedule.availability &&
    schedule.availability.constraints &&
    schedule.availability.constraints.slotDurations &&
    schedule.availability.constraints.slotDurations.length > 0
    ? schedule.availability.constraints.slotDurations[0]
    : null;
}

export const convertServiceCategoryToOfferingCategory = (
  category: Category,
): OfferingCategory => ({
  id: category.id,
  name: category.name,
  order:
    category.customProperties && category.customProperties.order
      ? +category.customProperties.order
      : 0,
  type: 'SERVICE',
});

export const convertOfferingCategoryToServiceCategory = (
  category: OfferingCategory,
): Category => ({
  id: category.id,
  name: category.name,
  customProperties: { order: `${category.order}` },
  status: null,
});
