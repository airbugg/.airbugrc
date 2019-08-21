import { IndividualOfferingDto } from '../../../dto/offerings/individual-offering.dto';
import { GroupOfferingDto } from '../../../dto/offerings/group-offering.dto';
import { CourseOfferingDto } from '../../../dto/offerings/course-offering.dto';
import {
  OfferedAsType,
  OfferingDto,
  PaymentType,
  Payment,
} from '../../../dto/offerings/offering.dto';
import {
  CreateServiceRequest,
  LinkedSchedule,
  Schedule,
  Service,
  UpdateServiceRequest,
} from '@wix/ambassador-services-server';
import {
  LABELED_PRICE,
  LocationTypes,
  OfferingTypes,
} from '../../../dto/offerings/offerings.consts';
import { ServiceLocationType } from '../../consts';
import { mapWebImageToPlatformImage } from '../image/web-image-to-platfrom-image-mapper';
import { convertClassHoursToRecurringIntervals } from './class-hours/class-hours-to-reccuring-intervals';
import { BookingPolicyProperty } from '../../business/busniess-adapter-rpc';
import { BookingPolicy } from '@wix/ambassador-services-server/rpc';
import { DefaultValues } from '@wix/bookings-platform-adapter/lib/adapters/booking-policy/booking-policy';
import { minutesToUnits } from '../../../time-utils';

const moment = require('moment-timezone');
export const DEFAULT_SPLIT_INTERVAL = 30;
export const convertOfferingToService = (
  offering: IndividualOfferingDto | GroupOfferingDto | CourseOfferingDto,
  scheduleId = null,
  order = 0,
  businessProperties = new Map(),
  experiments: { [key: string]: string } = {},
): Service => {
  const fitnessExperimentOn =
    experiments['specs.wos.BookingsFitness'] === 'true';
  const cancelRescheduleHours = parseInt(
    businessProperties.get(
      BookingPolicyProperty.CANCELLATION_LEAD_TIME_AMOUNT_KEY,
    ),
    10,
  );
  const bookHours = parseInt(
    businessProperties.get(BookingPolicyProperty.BOOK_LEAD_TIME_AMOUNT_KEY),
    10,
  );

  const getProp = (key, defaultValue: any = '') =>
    businessProperties.get(key) || defaultValue;

  return {
    id: offering.id ? offering.id : null,
    categoryId: offering.categoryId,
    paymentOptions: {
      wixPayInPerson: isInPerson(offering.payment, offering.offeredAs),
      wixPayOnline: isOnline(offering.payment, offering.offeredAs),
      custom: !!offering.payment.isFree,
      wixPaidPlan: isPricingPlan(offering.offeredAs),
    },
    scheduleIds: scheduleId ? [scheduleId] : null,
    info: {
      tagLine: offering.info.tagLine,
      images: offering.info.images.map(image =>
        mapWebImageToPlatformImage(image),
      ),
      description: offering.info.description,
      name: offering.info.name,
    },
    customProperties: {
      order: `${offering.order ? offering.order : order}`,
      uouHidden: `${offering.schedulePolicy.uouHidden === true}`,
    },
    policy: {
      isBookOnlineAllowed: !offering.schedulePolicy.displayOnlyNoBookFlow,
      maxParticipantsPerBooking:
        offering.schedulePolicy.maxParticipantsPerOrder,
      cancelRescheduleUpToXMinutesBefore: cancelRescheduleHours * 60,
      bookUpToXMinutesBefore: bookHours * 60,
      ...(fitnessExperimentOn && {
        waitingListPolicy: {
          isEnabled:
            getProp(
              BookingPolicyProperty.WAITLIST_ENABLED_KEY,
              DefaultValues.waitlistSettings.isEnabled,
            ) === 'true',
          capacity: Number(
            getProp(
              BookingPolicyProperty.WAITLIST_CAPACIY,
              DefaultValues.waitlistSettings.capacity,
            ),
          ),
          timeWindowMinutes: Number(
            getProp(
              BookingPolicyProperty.WAITLIST_WINDOW_AMOUNT_KEY,
              minutesToUnits(
                DefaultValues.waitlistSettings.reservedFor.amount,
                DefaultValues.waitlistSettings.reservedFor.units,
              ),
            ),
          ),
        },
        ...(fitnessExperimentOn && {
          futureBookingsPolicy: {
            shouldLimit:
              getProp(
                BookingPolicyProperty.MAX_LEAD_TIME_ENABLED_KEY,
                DefaultValues.maxTimeBeforeBooking.shouldLimit,
              ) === 'true',

            limitXMinutesToTheFuture: Number(
              getProp(
                BookingPolicyProperty.MAX_LEAD_TIME_AMOUNT_KEY,
                minutesToUnits(
                  DefaultValues.maxTimeBeforeBooking.amountOfTime.amount,
                  DefaultValues.maxTimeBeforeBooking.amountOfTime.units,
                ),
              ),
            ),
          },
        }),
      }),
    } as BookingPolicy,
    status: null,
  } as Service;
};

function isInPerson(payment: Payment, offeredAsList: OfferedAsType[]): boolean {
  if (isPricingPlanOnly(offeredAsList)) {
    return false;
  }
  if (payment.isFree) {
    return true;
  }
  return [PaymentType.OFFLINE, PaymentType.ALL].includes(payment.paymentType);
}

function isOnline(payment: Payment, offeredAsList: OfferedAsType[]): boolean {
  if (isPricingPlanOnly(offeredAsList) || payment.isFree) {
    return false;
  }
  const paymentType = payment.paymentType;
  return [PaymentType.ONLINE, PaymentType.ALL].includes(paymentType);
}

function isPricingPlan(offeredAsList: OfferedAsType[]) {
  return offeredAsList.includes(OfferedAsType.PRICING_PLAN);
}

function isPricingPlanOnly(offeredAsList: OfferedAsType[]): boolean {
  return isPricingPlan(offeredAsList) && offeredAsList.length === 1;
}

export const getLinkedSchedule = (
  staffList,
  offeringType = OfferingTypes.INDIVIDUAL,
): LinkedSchedule[] => {
  const transparency =
    offeringType === OfferingTypes.INDIVIDUAL ? 'BUSY' : 'FREE';

  return staffList.map(staff => ({
    scheduleId:
      staff.schedules && staff.schedules[0] ? staff.schedules[0].id : null,
    transparency,
    scheduleOwnerId: staff.id,
  }));
};

export const getLocation = offeringLocation => {
  let locationType;
  let address = null;

  switch (offeringLocation.type) {
    case LocationTypes.CUSTOMER:
      locationType = ServiceLocationType.CUSTOM;
      break;
    case LocationTypes.OTHER:
      locationType = ServiceLocationType.OWNER_CUSTOM;
      address = offeringLocation.locationText;
      break;
    case LocationTypes.BUSINESS:
    default:
      locationType = ServiceLocationType.OWNER_BUSINESS;
  }

  return {
    address,
    locationType,
  };
};

function getAmountAsString(amount) {
  return amount ? `${+amount}` : '0';
}

function getPriceText(offering: OfferingDto) {
  const text = offering.payment.isFree
    ? offering.payment.priceText
    : offering.pricingPlanInfo.displayText;
  return text;
}

function getRate(offering) {
  const labeledPriceOptions = {};
  if (isRateNeeded(offering)) {
    labeledPriceOptions[LABELED_PRICE] = {
      currency: offering.payment.currency,
      amount: getAmountAsString(offering.payment.price),
      downPayAmount: getAmountAsString(offering.payment.minCharge),
    };
  }
  return {
    priceText: getPriceText(offering),
    labeledPriceOptions,
  };
}

function isRateNeeded(offering): boolean {
  if (offering.payment.price && !offering.payment.isFree) {
    return true;
  }
  return false;
}

function getAvailability(
  offering,
  staffLinkedSchedules,
  splitInterval,
  timezone,
) {
  if (offering.type === OfferingTypes.INDIVIDUAL) {
    return {
      constraints: {
        splitInterval,
        timeBetweenSlots: (offering as any).schedulePolicy
          .minutesBetweenAppointments,
        slotDurations: [(offering as any).schedule.durationInMinutes],
      },
      start: moment()
        .tz(timezone || 'Asia/Jerusalem')
        .toISOString(),
      linkedSchedules: getCostraintsLinkedSchedules(
        offering,
        staffLinkedSchedules,
      ),
    };
  }

  return {
    start: moment
      .tz(offering.schedule.startDate, timezone || 'Asia/Jerusalem')
      .startOf('day')
      .toISOString(),
    end: moment
      .tz(offering.schedule.endDate, timezone || 'Asia/Jerusalem')
      .endOf('day')
      .toISOString(),
    linkedSchedules: [], // hack until server will fix the requirement for linked schedules
  };
}

export const convertOfferingToSchedule = (
  offering: IndividualOfferingDto | GroupOfferingDto | CourseOfferingDto,
  staffLinkedSchedules = [],
  scheduleId = null,
  splitInterval = 30,
  timezone = 'Etc/GMT',
): Schedule => {
  const schedule: Schedule = {
    id: scheduleId,
    scheduleOwnerId: offering.id,
    rate: getRate(offering),
    totalNumberOfParticipants: null, //todo
    location: getLocation(offering.location),
    title: offering.info.name,
    intervals: getRecurringIntervals(offering, staffLinkedSchedules, timezone),
    tags: [offering.type],
    participants: [], //todo
    capacity: offering.schedulePolicy.capacity,
    availability: getAvailability(
      offering,
      staffLinkedSchedules,
      splitInterval,
      timezone,
    ),
    status: 'UNDEFINED',
  };

  return schedule;
};

function getCostraintsLinkedSchedules(offering, staffLinkedSchedules) {
  // todo uncomment when server will fix the linkedSchedules requirement
  // if (offering.type !== OfferingTypes.INDIVIDUAL) {
  // return [];
  // }
  return staffLinkedSchedules;
}

function getIntervalDuration(offering) {
  if (offering.type === OfferingTypes.GROUP) {
    return (offering as GroupOfferingDto).schedule.durationInMinutes;
  }

  return null;
}

function getIntervalRepetition(offering) {
  return (offering as CourseOfferingDto).schedule.repeatEveryXWeeks
    ? (offering as CourseOfferingDto).schedule.repeatEveryXWeeks
    : 1;
}

function getRecurringIntervals(
  offering,
  staffLinkedSchedules,
  timezone: string,
) {
  if (offering.type === OfferingTypes.INDIVIDUAL) {
    return [];
  }

  const classHours = (offering as GroupOfferingDto).schedule.classHours;
  const start = (offering as GroupOfferingDto).schedule.startDate;
  const end = (offering as GroupOfferingDto).schedule.endDate;

  const duration = getIntervalDuration(offering);
  const repetition = getIntervalRepetition(offering);

  return convertClassHoursToRecurringIntervals(
    classHours,
    staffLinkedSchedules,
    start,
    end,
    timezone,
    duration,
    repetition,
  );
}

function getSplitInterval(businessProperties) {
  return parseInt(
    businessProperties.get(BookingPolicyProperty.CALENDAR_TIME_INTERVAL_KEY) ||
      DEFAULT_SPLIT_INTERVAL,
    10,
  );
}

export const convertOfferingToServiceRequest = (
  offering: IndividualOfferingDto | GroupOfferingDto | CourseOfferingDto,
  allStaffList = [],
  scheduleId = null,
  order = 0,
  businessProperties = new Map(),
  timezone = null,
  experiments,
): CreateServiceRequest => {
  const service = convertOfferingToService(
    offering,
    scheduleId,
    order,
    businessProperties,
    experiments,
  );
  const offeringStaffList = getStaffByOffering(allStaffList, offering);
  const splitInterval = getSplitInterval(businessProperties);
  const schedules = [
    convertOfferingToSchedule(
      offering,
      getLinkedSchedule(offeringStaffList, offering.type),
      scheduleId,
      splitInterval,
      timezone,
    ),
  ];
  return {
    schedules,
    service,
  };
};

export const convertOfferingToUpdateServiceRequest = (
  offering: IndividualOfferingDto | GroupOfferingDto | CourseOfferingDto,
  notifyParticipants: boolean,
  allStaffList = [],
  scheduleId = null,
  order = 0,
  businessProperties = new Map(),
  timezone,
  experiments,
): UpdateServiceRequest => {
  const splitInterval = getSplitInterval(businessProperties);
  const service = convertOfferingToService(
    offering,
    scheduleId,
    order,
    businessProperties,
    experiments,
  );
  const offeringStaffList = getStaffByOffering(allStaffList, offering);
  const schedules = [
    convertOfferingToSchedule(
      offering,
      getLinkedSchedule(offeringStaffList, offering.type),
      scheduleId,
      splitInterval,
      timezone,
    ),
  ];
  return {
    notifyParticipants,
    schedules,
    service,
  };
};

function filterIndividualOfferingStaff(staff, offering) {
  if (offering.schedulePolicy.staffMembersIds) {
    return (offering as IndividualOfferingDto).schedulePolicy.staffMembersIds.includes(
      staff.id,
    );
  }

  return false;
}

function filterGroupOfferingStaff(staff, offering: GroupOfferingDto) {
  if (offering.schedule.classHours) {
    const classHours = offering.schedule.classHours;
    for (const day of Object.keys(classHours)) {
      if (!classHours[day]) {
        continue;
      }

      for (const hour of classHours[day].workingHours) {
        if (hour.staffId === staff.id) {
          return true;
        }
      }
    }
  }

  return false;
}

export const getStaffByOffering = (staffList, offering) => {
  const linkedSchedules = staffList
    .filter(
      staff =>
        filterIndividualOfferingStaff(staff, offering) ||
        filterGroupOfferingStaff(staff, offering),
    )
    .filter(staff => !!staff.schedules);

  return linkedSchedules;
};

export const convertOfferingToOrderedService = (
  offering: OfferingDto,
  categoryId: string,
): Service => {
  return {
    id: offering.id,
    customProperties: { order: `${offering.order}` },
    categoryId,
    scheduleIds: [],
    status: null,
  };
};
