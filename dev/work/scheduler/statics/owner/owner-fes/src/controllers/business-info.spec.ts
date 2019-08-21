import { getInfo } from '../adapters/business/busniess-adapter';
import { Business } from '../dto/business-info/business-info.dto';
import {
  aNineToFiveInterval,
  aSimpleSchedule,
} from '../../test/builders/rpc-custom/schedule-builder';
import { mapScheduleToWorkingHours } from '../adapters/mappers/working-hours/schedule-to-working-hours-mapper';
import { Chance } from 'chance';
import { createBusinessInfo } from '../../test/builders/dto/business-info.dto.builder';
import { Service } from '@wix/ambassador-services-server';
import { fackI18nInstance } from '../../test/builders/fack-i18n';
import { updateBookingPolicyInAllServices } from './business-info';
import {
  aGetServiceResponse,
  aListServicesResponse,
} from '@wix/ambassador-services-catalog-server/builders';
import { GetServiceResponse } from '@wix/ambassador-services-catalog-server/rpc';
import {
  aGetInfoViewResponse,
  aGetPropertiesResponse,
} from '@wix/ambassador-business-server/builders';
import { PremiumInfo } from '@wix/ambassador-business-server/types';
import { aResource } from '@wix/ambassador-resources-server/builders';
import { aNotification } from '@wix/ambassador-notifications-server/builders';
import { NotificationType } from '@wix/ambassador-notifications-server/rpc';
import {
  aBookingPolicy,
  anUpdateServiceResponse,
  aService,
} from '@wix/ambassador-services-server/builders';

describe('Business info', () => {
  const chance = new Chance();
  let notifications;

  beforeEach(() => {
    notifications = [
      aNotification()
        .withType(NotificationType.REMINDER_EMAIL)
        .build(),
    ];
  });
  it('should return the business hours from Business resource ', async () => {
    const rpcBusinessInfo = aGetInfoViewResponse()
      .withPremiumInfo(PremiumInfo.NO_PREMIUM)
      .build();
    const propertiesResponse = aGetPropertiesResponse().build();
    const schedule = aSimpleSchedule([aNineToFiveInterval.bind(null, 'SUN')]);
    const businessResource = aResource()
      .withSchedules([schedule])
      .build();

    const businessInfo: Business = await getInfo(
      async () => rpcBusinessInfo,
      async () => propertiesResponse,
      async () => businessResource,
      async () => notifications,
      fackI18nInstance,
    );
    expect(businessInfo.workingHours).toEqual(
      mapScheduleToWorkingHours(schedule),
    );
  });

  it('should bulk update all services', async () => {
    const bookHours = chance.integer({ min: 0, max: 48 });
    const cancelHours = chance.integer({ min: 0, max: 48 });

    const business = createBusinessInfo();
    business.cancellationLeadTime = cancelHours;
    business.leadTime = bookHours;

    const servicesLength = chance.integer({ min: 0, max: 12 });

    const services: Service[] = [];
    for (let i = 0; i < servicesLength; i++) {
      services.push(
        aService()
          .withPolicy(aBookingPolicy().build())
          .build(),
      );
    }

    const bookMinutesArr = [];
    const cancelMinutesArr = [];

    const policyUpdater = async (serviceResponses: GetServiceResponse[]) => {
      serviceResponses.forEach((response: GetServiceResponse) => {
        bookMinutesArr.push(response.service.policy.bookUpToXMinutesBefore);
        cancelMinutesArr.push(
          response.service.policy.cancelRescheduleUpToXMinutesBefore,
        );
      });
      return [new Promise(() => anUpdateServiceResponse().build())];
    };

    const servicesResponses = services.map(service =>
      aGetServiceResponse()
        .withService(service)
        .build(),
    );

    await updateBookingPolicyInAllServices(
      async () =>
        aListServicesResponse()
          .withServices(servicesResponses)
          .build(),
      policyUpdater,
      business,
    );

    expect(bookMinutesArr.every(val => val === bookHours * 60)).toBeTruthy();
    expect(
      cancelMinutesArr.every(val => val === cancelHours * 60),
    ).toBeTruthy();
  });

  it('should not bulk update if there are no services', async () => {
    const business = createBusinessInfo();
    const services: Service[] = [];
    const policyUpdater = jest.fn();

    const servicesResponses = services.map(service =>
      aGetServiceResponse()
        .withService(service)
        .build(),
    );

    await updateBookingPolicyInAllServices(
      async () =>
        aListServicesResponse()
          .withServices(servicesResponses)
          .build(),
      policyUpdater,
      business,
    );

    expect(policyUpdater).not.toHaveBeenCalled();
  });
});

//function getTimezoneOffset(timezone): string {}

/*
--address: null
--apartmentNum: null
**appStatus: {services: false, calendar: false, businessInfo: false, payments: false}
?businessLocation: "LOCAL"
?businessType: "PHOTOGRAPHY"
cancellationLeadTime: null
//cancellationPolicy: null
city: null
classConfirmationEmail: {subject: "Thanks for booking!",…}
confirmationEmail: {subject: "Thanks for booking!", greeting: "",…}
connectedCalendars: {google: false}
--currency: "ILS"
--email: "amits@wix.com"
--formattedAddress: null
groupCancellationEmail: {subject: "Cancellation of",…}
--language: "da"
leadTime: null
--name: ""
?notes: null
payments: null
phone: ""
pointOfSale: null
remindersEmails: {individualEmail: {subject: "This is your friendly reminder",…},…}
slotLength: null
timeZone: "Asia/Jerusalem"
timeZoneOffset: "+0200"
useReminders: null
workingHours: {mon: [{startTime: "10:00:00.000", endTime: "18:00:00.000"}],…}
zipCode: null
 */
