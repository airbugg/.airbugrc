import { BookingPolicyProperty } from './busniess-adapter-rpc';
import { Resource } from '@wix/ambassador-resources-server/rpc';
import {
  GetInfoViewResponse,
  GetPropertiesResponse,
  UpdatePropertiesRequest,
  UpdatePropertiesResponse,
} from '@wix/ambassador-business-server';
import { OfferingTypes } from '../../dto/offerings/offerings.consts';
import { Notification } from '@wix/ambassador-notifications-server';
import { Business } from '../../dto/business-info/business-info.dto';
import {
  extractNotification,
  getNotificationKey,
  getNotificationMapWithDefault,
  getUseReminders,
} from '../notifications/notification-adapter';
import { mapScheduleToWorkingHours } from '../mappers/working-hours/schedule-to-working-hours-mapper';
import { mapCustomPropertiesToMap } from '../mappers/custom-properties/custom-properties-to-map-mapper';
import { mapMapToCustomProperties } from '../mappers/custom-properties/map-to-custom-properties-mapper';

function configLang(i18nInstance: any, language: String) {
  i18nInstance.setLocale(language);
  return i18nInstance;
}

export async function getInfo(
  getterOfBusinessInfo: () => Promise<GetInfoViewResponse>,
  getterOfBusinessProperties: () => Promise<GetPropertiesResponse>,
  getterOfBusinessResource: () => Promise<Resource>,
  getterOfNotificationSetup: () => Promise<Notification[]>,
  i18nInstance: any,
) {
  const [
    businessInfoResponse,
    businessPropertiesResponse,
    businessResource,
    notificationSetup,
  ] = await Promise.all([
    getterOfBusinessInfo(),
    getterOfBusinessProperties(),
    getterOfBusinessResource(),
    getterOfNotificationSetup(),
  ]);
  const businessProperties: Map<string, string> = mapCustomPropertiesToMap(
    businessPropertiesResponse.customProperties,
  );
  i18nInstance = configLang(i18nInstance, businessInfoResponse.language);
  const notificationMap = getNotificationMapWithDefault(
    notificationSetup,
    i18nInstance.__.bind(i18nInstance),
  );
  const useReminders = getUseReminders(notificationSetup);
  const businessInfo: Business = {
    businessType: 'business',
    language: businessInfoResponse.language,
    locale: businessInfoResponse.locale,
    email: businessInfoResponse.email,
    currency: businessInfoResponse.currency,
    phone: businessInfoResponse.phone,
    name: businessInfoResponse.name,
    timeZone: businessInfoResponse.timeZone,
    leadTime: parseInt(
      businessProperties.get(BookingPolicyProperty.BOOK_LEAD_TIME_AMOUNT_KEY),
      10,
    ),
    cancellationLeadTime: parseInt(
      businessProperties.get(
        BookingPolicyProperty.CANCELLATION_LEAD_TIME_AMOUNT_KEY,
      ),
      10,
    ),
    formattedAddress: businessInfoResponse.formattedAddress,
    businessLocation: getBusinessLocation(businessInfoResponse.businessType),
    cancellationPolicy: businessProperties.get(
      BookingPolicyProperty.CANCELLATION_POLICY_KEY,
    ),
    workingHours: mapScheduleToWorkingHours(businessResource.schedules[0]),
    classConfirmationEmail: notificationMap.get(
      getNotificationKey(OfferingTypes.GROUP, 'CONFIRMATION_EMAIL'),
    ),
    connectedCalendars: {},
    confirmationEmail: notificationMap.get(
      getNotificationKey(OfferingTypes.INDIVIDUAL, 'CONFIRMATION_EMAIL'),
    ),
    useReminders,
    remindersEmails: {
      individualEmail: notificationMap.get(
        getNotificationKey(OfferingTypes.INDIVIDUAL, 'REMINDER_EMAIL'),
      ),
      classEmail: notificationMap.get(
        getNotificationKey(OfferingTypes.GROUP, 'REMINDER_EMAIL'),
      ),
    },
    groupCancellationEmail: notificationMap.get(
      getNotificationKey(OfferingTypes.GROUP, 'CANCELLATION_EMAIL'),
    ),
    slotLength: parseInt(
      businessProperties.get(BookingPolicyProperty.CALENDAR_TIME_INTERVAL_KEY),
      10,
    ),
  };
  return businessInfo;
}

export async function getTimezone(
  getterOfBusinessInfo: () => Promise<GetInfoViewResponse>,
) {
  const businessInfo = await getterOfBusinessInfo();
  return businessInfo.timeZone;
}

function getBusinessLocation(businessType: string): string {
  return businessType === 'ON_LOCATION' ? 'LOCAL' : 'ON_THE_GO';
}

export async function updateBusiness(
  updaterOfNotificationsTemplate,
  getterOfBusinessCustomProperties: () => Promise<GetPropertiesResponse>,
  updaterOfBusinessCustomProperties: (
    UpdatePropertiesRequest,
  ) => Promise<UpdatePropertiesResponse>,
  businessInfo: Business,
) {
  const notifications = extractNotification(businessInfo);
  const {
    slotLength,
    cancellationPolicy,
    cancellationLeadTime,
    leadTime,
  } = businessInfo;
  const businessPropertiesResponse: GetPropertiesResponse = await getterOfBusinessCustomProperties();

  const customProperties: Map<string, string> = mapCustomPropertiesToMap(
    businessPropertiesResponse.customProperties,
  );
  if (slotLength) {
    customProperties.set(
      BookingPolicyProperty.CALENDAR_TIME_INTERVAL_KEY,
      slotLength.toString(10),
    );
  }
  if (cancellationPolicy) {
    customProperties.set(
      BookingPolicyProperty.CANCELLATION_POLICY_KEY,
      cancellationPolicy,
    );
  }
  if (cancellationLeadTime || cancellationLeadTime === 0) {
    customProperties.set(
      BookingPolicyProperty.CANCELLATION_LEAD_TIME_AMOUNT_KEY,
      cancellationLeadTime.toString(10),
    );
  }
  if (leadTime || leadTime === 0) {
    customProperties.set(
      BookingPolicyProperty.BOOK_LEAD_TIME_AMOUNT_KEY,
      leadTime.toString(10),
    );
  }
  const updateCustomPropsRequest: UpdatePropertiesRequest = {
    customProperties: mapMapToCustomProperties(customProperties),
  };

  await updaterOfBusinessCustomProperties(updateCustomPropsRequest);

  await updaterOfNotificationsTemplate(notifications);
  return 1;
}
