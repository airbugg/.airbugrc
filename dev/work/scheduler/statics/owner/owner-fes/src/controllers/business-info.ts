import {
  getBusinessInfoViewFactory,
  getBusinessPropertiesFactory,
  updaterBusinessPropertiesFactory,
} from '../adapters/business/busniess-adapter-rpc';
import {
  getInfo,
  getTimezone,
  updateBusiness,
} from '../adapters/business/busniess-adapter';
import {
  getterOfBusinessResourceFactory,
  updaterOfResourceFactory,
} from '../adapters/resources/resources-adapter-rpc';
import {
  getNotificationSetupFactory,
  updateNotificationsFactory,
} from '../adapters/notifications/notification-adapter-rpc';
import { updateBusinessResource } from '../adapters/resources/resources-adapter';
import { servicesBookingPolicyUpdater } from '../adapters/offerings/services-server-rpc';
import {
  GetterOfferingsList,
  getterOfferingsListFactory,
} from '../adapters/offerings/services-catalog-rpc';
import { UpdateServiceResponse } from '@wix/ambassador-services-server/rpc';
import { ListServicesResponse } from '@wix/ambassador-services-catalog-server/rpc';
import { Business } from '../dto/business-info/business-info.dto';

export async function getBusinessInfo(req, res, config) {
  const businessInfoView = await getInfo(
    getBusinessInfoViewFactory(req.aspects),
    getBusinessPropertiesFactory(req.aspects),
    getterOfBusinessResourceFactory(req.aspects),
    getNotificationSetupFactory(req.aspects),
    config.i18n,
  );
  res.send(businessInfoView);
}

export async function getBusinessTimezone(req, res) {
  const timezone = await getTimezone(getBusinessInfoViewFactory(req.aspects));
  res.send({ timeZone: timezone });
}
export async function getTras(req, res, config) {
  res.send(config.i18n.__('app.intro'));
}
export async function updateBusinessInfo(req, res) {
  const updateOfNotifications = updateNotificationsFactory(req.aspects);
  await Promise.all([
    updateBusiness(
      updateOfNotifications,
      getBusinessPropertiesFactory(req.aspects),
      updaterBusinessPropertiesFactory(req.aspects),
      req.body,
    ),
    updateBusinessResource(
      req.body,
      getterOfBusinessResourceFactory(req.aspects),
      updaterOfResourceFactory(req.aspects),
    ),
  ]);
  await updateBookingPolicyInAllServices(
    getterOfferingsListFactory(req.aspects),
    servicesBookingPolicyUpdater(req.aspects),
    req.body,
  );
  res.send({});
}

export async function updateBookingPolicyInAllServices(
  servicesListGetter: GetterOfferingsList,
  bookingPolicyUpdater: ([]) => Promise<UpdateServiceResponse[]>,
  business: Business,
): Promise<UpdateServiceResponse[]> {
  const { services } = await servicesListGetter(false);
  if (!services || !services.length) {
    return;
  }

  const servicesList = services.map(serviceResponse => {
    const service = serviceResponse.service;
    service.policy.bookUpToXMinutesBefore = business.leadTime * 60; // hours to minutes
    service.policy.cancelRescheduleUpToXMinutesBefore =
      business.cancellationLeadTime * 60; // hours to minutes

    const schedules = serviceResponse.schedules;
    if (
      schedules &&
      schedules[0] &&
      schedules[0].availability &&
      schedules[0].availability.constraints
    ) {
      schedules[0].availability.constraints.splitInterval = business.slotLength;
    }

    return { service, schedules };
  });

  return bookingPolicyUpdater(servicesList);
}

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
