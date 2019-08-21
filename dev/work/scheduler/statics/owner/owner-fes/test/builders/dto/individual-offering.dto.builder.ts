import { Chance } from 'chance';
import {
  PaymentType,
  OfferedAsType,
} from '../../../src/dto/offerings/offering.dto';
import {
  WorkingDay,
  WorkingDayName,
} from '../../../src/dto/offerings/individual-working-days.dto';
import { PricingPlanDto } from '../../../src/dto/pricing-plans/pricing-plan.dto';
import { IndividualOfferingDto } from '../../../src/dto/offerings/individual-offering.dto';
import {
  OfferingTypes,
  LocationTypes,
} from '../../../src/dto/offerings/offerings.consts';

function validIndividualOffering(): IndividualOfferingDto {
  const chance = new Chance();
  const staff = ['staff_id_14', 'staff_id_05', 'staff_id_20'];

  return {
    id: chance.guid(),
    categoryId: chance.guid(),
    order: 0,
    type: OfferingTypes.INDIVIDUAL,
    info: {
      name: 'individual lonely and sad',
      description:
        'A description of an individual offering, this is not an individual service, or appointment, its an individual OFFERING.',
      images: [
        {
          fileName: '23c6ed3f5e614c09b28a14d774acf206.jpg',
          relativeUri: '23c6ed3f5e614c09b28a14d774acf206.jpg',
          width: 5312,
          height: 2988,
        },
      ],
      tagLine: 'a tagline',
    },
    location: {
      type: 'BUSINESS',
      locationText: 'Location',
    },
    payment: {
      currency: 'USD',
      price: 10,
      isFree: false,
      priceText: '',
      minCharge: 0,
      paymentType: PaymentType.OFFLINE,
    },
    offeredAs: [],
    schedulePolicy: {
      maxParticipantsPerOrder: 1,
      capacity: 1,
      minutesBetweenAppointments: 30,
      displayOnlyNoBookFlow: false,
      isBookable: true,
      uouHidden: false,
      staffMembersIds: staff,
    },
    schedule: {
      // startDate: parseInt(now.clone().format('x'), 10),
      // endDate: parseInt(now.clone().format('x'), 10),
      startDate: chance.timestamp(),
      endDate: chance.timestamp(),
      noEndDate: true,
      durationInMinutes: 10,
      staffAvailability: buildStaffAvailability(),
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

function initialIndividualOffering(): IndividualOfferingDto {
  return {
    id: '',
    categoryId: '',
    order: null,
    type: OfferingTypes.INDIVIDUAL,
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
      maxParticipantsPerOrder: 1,
      capacity: 1,
      minutesBetweenAppointments: 0,
      displayOnlyNoBookFlow: false,
      isBookable: true,
      uouHidden: false,
      staffMembersIds: [],
    },
    schedule: {
      startDate: null,
      endDate: null,
      noEndDate: true,
      durationInMinutes: null,
      staffAvailability: [],
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

export function buildNonAvailableStaff(): WorkingDay[] {
  return [];
}

export function buildStaffAvailabilityWithOneStaffMember(): WorkingDay[] {
  const staff = [{ id: '1', fullName: 'Im alone' }];
  return [
    {
      day: WorkingDayName.MONDAY,
      workingHours: [
        {
          staff,
          interval: { startTime: '09:00', endTime: '19:00' },
        },
        {
          staff,
          interval: { startTime: '08:00', endTime: '15:00' },
        },
      ],
    },
    {
      day: WorkingDayName.TUESDAY,
      workingHours: [
        {
          staff,
          interval: { startTime: '09:00', endTime: '21:00' },
        },
      ],
    },
  ];
}

export function buildStaffAvailability(
  staff = [
    { id: 'staff_id_14', fullName: 'Some Name' },
    {
      id: 'staff_id_15',
      fullName: 'GBT',
    },
  ],
): WorkingDay[] {
  return [
    {
      day: WorkingDayName.WEDNESDAY,
      workingHours: [
        {
          staff,
          interval: { startTime: '09:00', endTime: '19:00' },
        },
        {
          staff,
          interval: { startTime: '08:00', endTime: '15:00' },
        },
      ],
    },
    {
      day: WorkingDayName.THURSDAY,
      workingHours: [
        {
          staff: [staff[0]],
          interval: { startTime: '09:00', endTime: '21:00' },
        },
        {
          staff: [staff[1]],
          interval: { startTime: '10:00', endTime: '01:00' },
        },
      ],
    },
  ];
}

export class IndividualOfferingDtoBuilder {
  individualOffering: IndividualOfferingDto = { ...validIndividualOffering() };

  private setOfferedAsType(offeredAs: OfferedAsType) {
    if (this.individualOffering.offeredAs.indexOf(offeredAs) === -1) {
      this.individualOffering.offeredAs.push(offeredAs);
    }
  }

  private setPricingPlanType() {
    this.setOfferedAsType(OfferedAsType.PRICING_PLAN);
  }

  private setOneTimeType() {
    this.setOfferedAsType(OfferedAsType.ONE_TIME);
  }

  withId(id: string) {
    this.individualOffering.id = id;
    return this;
  }

  offeredAs(offeredAs: OfferedAsType[]) {
    this.individualOffering.offeredAs = offeredAs;
    return this;
  }

  offeredAsSingleSession() {
    this.setOneTimeType();
    this.individualOffering.pricingPlanInfo.pricingPlans = [];
    return this;
  }

  withPricingPlans(pricingPlans: PricingPlanDto[]) {
    this.setPricingPlanType();
    this.individualOffering.pricingPlanInfo.pricingPlans = pricingPlans;
    return this;
  }

  withPricingPlanNotAssociated() {
    this.individualOffering.pricingPlanInfo = {
      displayText: 'pp not associated',
      pricingPlans: [],
    };
    this.setPricingPlanType();
    return this;
  }

  withSingleSession() {
    this.setOneTimeType();
    return this;
  }

  withPricingPlanText(text: string) {
    this.individualOffering.pricingPlanInfo.displayText = text;
    return this;
  }

  withCategoryId(cid: string) {
    this.individualOffering.categoryId = cid;
    return this;
  }

  withLocation(location) {
    this.individualOffering.location.type = location.type;
    this.individualOffering.location.locationText = location.locationText;
    return this;
  }

  withPayment(payment) {
    this.individualOffering.payment.currency = payment.currency;
    this.individualOffering.payment.isFree = payment.isFree;
    this.individualOffering.payment.minCharge = payment.minCharge;
    this.individualOffering.payment.price = payment.price;
    this.individualOffering.payment.priceText = payment.priceText;
    this.individualOffering.payment.paymentType = payment.paymentType;
    return this;
  }

  withName(name: string) {
    this.individualOffering.info.name = name;
    return this;
  }

  withImages(images) {
    this.individualOffering.info.images = images;
    return this;
  }

  withPrice(price: number) {
    this.individualOffering.payment.price = price;
    return this;
  }

  withPaymentType(paymentType: PaymentType) {
    this.individualOffering.payment.paymentType = paymentType;
    return this;
  }

  withMinCharge(minCharge: number) {
    this.individualOffering.payment.minCharge = minCharge;
    return this;
  }

  withOrder(order: number) {
    this.individualOffering.order = order;
    return this;
  }

  withStaffIds(staff) {
    this.individualOffering.schedulePolicy.staffMembersIds = staff;
    return this;
  }

  withDurationInMinutes(durationInMinutes: number) {
    this.individualOffering.schedule.durationInMinutes = durationInMinutes;
    return this;
  }

  asFree() {
    this.individualOffering.payment.isFree = true;
    return this;
  }

  withDescription(description: string) {
    this.individualOffering.info.description = description;
    return this;
  }

  withStartDate(startDate: string) {
    this.individualOffering.schedule.startDate = startDate;
    return this;
  }

  withEndDate(endDate: string) {
    this.individualOffering.schedule.endDate = endDate;
    return this;
  }

  withMinutesBetweenAppointments(minutesBetweenAppointments: number) {
    this.individualOffering.schedulePolicy.minutesBetweenAppointments = minutesBetweenAppointments;
    return this;
  }

  withTagline(tagLine: string) {
    this.individualOffering.info.tagLine = tagLine;
    return this;
  }

  notBookable() {
    this.individualOffering.schedulePolicy.isBookable = false;
    return this;
  }

  notAvailable() {
    this.individualOffering.schedule.staffAvailability = buildNonAvailableStaff();
    return this;
  }

  withOneStaffMember() {
    this.individualOffering.schedule.staffAvailability = buildStaffAvailabilityWithOneStaffMember();
    return this;
  }

  setUoUVisibility(uouVisibility: boolean) {
    this.individualOffering.schedulePolicy.uouHidden = !uouVisibility;
    return this;
  }

  withOutRandom() {
    this.individualOffering.id = 'not random id';
    this.individualOffering.categoryId = 'not random categoryId';
    this.individualOffering.schedule.startDate = '100000000000000';
    this.individualOffering.schedule.endDate = '100000000000000';
    return this;
  }

  withPricingPlan({
    id = '123',
    name = 'default name',
    status = 'active',
    displayText = 'default display text',
  }) {
    this.individualOffering.pricingPlanInfo = {
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

  withArchivedPricingPlan({
    id = '123',
    name = 'default name',
    status = 'archived',
    displayText = 'default display text',
  }) {
    this.individualOffering.pricingPlanInfo = {
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

  asDisplayOnly() {
    this.individualOffering.schedulePolicy.displayOnlyNoBookFlow = true;
    this.individualOffering.payment.paymentType = null;
    return this;
  }

  build() {
    if (this.individualOffering.offeredAs.length === 0) {
      this.individualOffering.offeredAs = [OfferedAsType.ONE_TIME];
    }

    return this.individualOffering;
  }

  buildInitialIndividualOffering() {
    return { ...initialIndividualOffering() };
  }
}
