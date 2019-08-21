import { getInfo, updateBusiness } from './busniess-adapter';
import { createBusinessInfo } from '../../../test/builders/dto/business-info.dto.builder';
import { OfferingTypes } from '../../dto/offerings/offerings.consts';
import {
  Notification,
  NotificationType,
} from '@wix/ambassador-notifications-server';

import {
  aNineToFiveInterval,
  aSimpleSchedule,
} from '../../../test/builders/rpc-custom/schedule-builder';
import { Business } from '../../dto/business-info/business-info.dto';
import { aBusinessResource } from '../../../test/builders/rpc-custom/resource-builder';
import { Chance } from 'chance';
import { BookingPolicyProperty } from './busniess-adapter-rpc';
import { fackI18nInstance } from '../../../test/builders/fack-i18n';
import { aNotification } from '@wix/ambassador-notifications-server/builders';
import {
  aGetInfoViewResponse,
  aGetPropertiesResponse,
  anUpdatePropertiesRequest,
  aProperty,
} from '@wix/ambassador-business-server/builders';
import { aResource } from '@wix/ambassador-resources-server/builders';

function findNotification(
  notificationList: Notification[],
  type: NotificationType,
  tag: string,
) {
  return notificationList.find((notification: Notification) => {
    return notification.tag === tag && notification.type === type;
  });
}

const aLeadTime = () => Chance().integer({ min: 1, max: 72 });

describe('get business info', () => {
  let notifications;

  beforeEach(() => {
    notifications = [
      aNotification()
        .withType(NotificationType.REMINDER_EMAIL)
        .build(),
    ];
  });
  it('should return the empty object connected calendars', async () => {
    const business: Business = await getInfo(
      async () => aGetInfoViewResponse().build(),
      async () => aGetPropertiesResponse().build(),
      async () => aBusinessResource(),
      async () => notifications,
      fackI18nInstance,
    );
    expect(business.connectedCalendars).toBeDefined();
  });

  it('should get calendar slot length', async () => {
    const splitInterval = Chance().pickone([5, 10, 15, 30, 60]);
    const business: Business = await getInfo(
      async () => aGetInfoViewResponse().build(),
      async () =>
        aGetPropertiesResponse()
          .withCustomProperties([
            aProperty()
              .withPropertyName(
                BookingPolicyProperty.CALENDAR_TIME_INTERVAL_KEY,
              )
              .withValue(splitInterval.toString())
              .build(),
          ])
          .build(),
      async () => aBusinessResource(),
      async () => notifications,
      fackI18nInstance,
    );
    expect(business.slotLength).toBe(splitInterval);
  });

  it('should get book lead time', async () => {
    const bookLeadTime = aLeadTime();
    const business: Business = await getInfo(
      async () => aGetInfoViewResponse().build(),
      async () =>
        aGetPropertiesResponse()
          .withCustomProperties([
            aProperty()
              .withPropertyName(BookingPolicyProperty.BOOK_LEAD_TIME_AMOUNT_KEY)
              .withValue(bookLeadTime.toString())
              .build(),
          ])
          .build(),
      async () => aBusinessResource(),
      async () => notifications,
      fackI18nInstance,
    );
    expect(business.leadTime).toBe(bookLeadTime);
  });

  it('should get cancellation lead time', async () => {
    const cancellationLeadTime = aLeadTime();
    const business: Business = await getInfo(
      async () => aGetInfoViewResponse().build(),
      async () =>
        aGetPropertiesResponse()
          .withCustomProperties([
            aProperty()
              .withPropertyName(
                BookingPolicyProperty.CANCELLATION_LEAD_TIME_AMOUNT_KEY,
              )
              .withValue(cancellationLeadTime.toString())
              .build(),
          ])
          .build(),
      async () => aBusinessResource(),
      async () => notifications,
      fackI18nInstance,
    );
    expect(business.cancellationLeadTime).toBe(cancellationLeadTime);
  });

  it('should return the default notification', async () => {
    const businessResource = aResource()
      .withSchedules([aSimpleSchedule([aNineToFiveInterval.bind(null, 'SUN')])])
      .build();
    // const confirmationNotification = aNotification()
    //   .withIsEnabled(true)
    //   .withTag(OfferingTypes.INDIVIDUAL)
    //   .withTemplate(template)
    //   .withType('CONFIRMATION_EMAIL')
    //   .build();
    // notificationList.push(confirmationNotification);
    // const remainderNotification = aNotification()
    //   .withIsEnabled(true)
    //   .withTag(OfferingTypes.GROUP)
    //   .withTemplate(template)
    //   .withType('REMINDER_EMAIL')
    //   .build();
    // notificationList.push(remainderNotification);
    const business = await getInfo(
      async () =>
        aGetInfoViewResponse()
          .withLanguage('es')
          .build(),
      async () => aGetPropertiesResponse().build(),
      async () => businessResource,
      async () => null,
      fackI18nInstance,
    );
    expect(business.confirmationEmail.body).toContain('confirmation');
    expect(business.confirmationEmail.body).toContain('es');
    expect(business.remindersEmails.classEmail.subject).toContain('reminder');
  });
});

describe('update business', () => {
  const chance = new Chance();

  it('should update notification', async () => {
    const mockNotificationUpdater = jest.fn();
    const businessInfo = createBusinessInfo();
    const res = await updateBusiness(
      mockNotificationUpdater,
      async () => aGetPropertiesResponse().build(),
      jest.fn(),
      businessInfo,
    );
    const notificationList = mockNotificationUpdater.mock.calls[0][0];
    const conformation = findNotification(
      notificationList,
      'CONFIRMATION_EMAIL',
      OfferingTypes.INDIVIDUAL,
    );

    expect(conformation.template.body).toEqual(
      businessInfo.confirmationEmail.body,
    );
    expect(conformation.template.subject).toEqual(
      businessInfo.confirmationEmail.subject,
    );
    expect(conformation.tag).toContain(OfferingTypes.INDIVIDUAL);
  });

  it('should update all at once notification', async () => {
    const mockNotificationUpdater = jest.fn();
    const businessInfo = createBusinessInfo();
    const res = await updateBusiness(
      mockNotificationUpdater,
      async () => aGetPropertiesResponse().build(),
      jest.fn(),
      businessInfo,
    );
    const notificationList = mockNotificationUpdater.mock.calls[0][0];
    expect(notificationList.length).toBe(5);
  });

  it('should update custom props', async () => {
    const businessInfo = createBusinessInfo();
    const oldCustomProps = aGetPropertiesResponse()
      .withCustomProperties([])
      .withErrors([])
      .build();
    const newCustomProps = anUpdatePropertiesRequest()
      .withCustomProperties([
        aProperty()
          .withPropertyName(BookingPolicyProperty.CALENDAR_TIME_INTERVAL_KEY)
          .withValue(businessInfo.slotLength.toString())
          .build(),
        aProperty()
          .withPropertyName(BookingPolicyProperty.CANCELLATION_POLICY_KEY)
          .withValue(businessInfo.cancellationPolicy)
          .build(),
        aProperty()
          .withPropertyName(
            BookingPolicyProperty.CANCELLATION_LEAD_TIME_AMOUNT_KEY,
          )
          .withValue(businessInfo.cancellationLeadTime.toString())
          .build(),
        aProperty()
          .withPropertyName(BookingPolicyProperty.BOOK_LEAD_TIME_AMOUNT_KEY)
          .withValue(businessInfo.leadTime.toString())
          .build(),
      ])
      .build();
    const mockPropertiesGetter = async () => oldCustomProps;
    const mockPropertiesUpdate = jest.fn();
    await updateBusiness(
      jest.fn(),
      mockPropertiesGetter,
      mockPropertiesUpdate,
      businessInfo,
    );
    expect(mockPropertiesUpdate.mock.calls[0][0]).toEqual(newCustomProps);
  });
});

function createAnAsyncFun(resolveWith) {
  return async () => {
    return new Promise(resolve => {
      resolve(resolveWith);
    });
  };
}
