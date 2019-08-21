import axios from 'axios';
import { BusinessServer } from '@wix/ambassador-business-server/rpc';
import {
  anUpdatePropertiesResponse,
  GetInfoViewResponseDTOBuilder,
  GetPropertiesRequestDTOBuilder,
  GetPropertiesResponseDTOBuilder,
} from '@wix/ambassador-business-server/builders';
import { BookingPolicyProperty } from '../../src/adapters/business/busniess-adapter-rpc';
import {
  aListResourcesResponse,
  anUpdateResourceResponse,
  aResource,
} from '@wix/ambassador-resources-server/builders';
import { ResourcesServer } from '@wix/ambassador-resources-server/rpc';
import {
  NotificationsServer,
  NotificationType,
} from '@wix/ambassador-notifications-server/rpc';
import {
  aGetSetupResponse,
  aNotification,
  aSetupResponse,
} from '@wix/ambassador-notifications-server/builders';
import { createBusinessInfo } from '../builders/dto/business-info.dto.builder';
import {
  aNineToFiveInterval,
  aSimpleSchedule,
} from '../builders/rpc-custom/schedule-builder';
import { aBusinessResource } from '../builders/rpc-custom/resource-builder';
import { ServicesServer } from '@wix/ambassador-services-server/rpc';
import {
  aBookingPolicy,
  anUpdateServiceResponse,
} from '@wix/ambassador-services-server/builders';

import {
  aGetServiceResponse,
  aListServicesResponse,
} from '@wix/ambassador-services-catalog-server/builders';
import { Chance } from 'chance';
import { ServicesCatalogServer } from '@wix/ambassador-services-catalog-server/rpc';
import { TestService } from '../builders/rpc-custom/service';

describe('Bookings platform', () => {
  function aGetInfoViewResponse() {
    return new GetInfoViewResponseDTOBuilder()
      .withEmail('email')
      .withFormattedAddress('address')
      .withCurrency('USD')
      .withLanguage('en')
      .withName('biz-name')
      .withPhone('phone')
      .withTimeZone('Asia/Brunei')
      .build();
  }

  function aGetPropertiesResponse() {
    return new GetPropertiesResponseDTOBuilder()
      .withCustomProperties([
        {
          propertyName: BookingPolicyProperty.CANCELLATION_POLICY_KEY,
          value: 'cancel now',
        },
        {
          propertyName: BookingPolicyProperty.CALENDAR_TIME_INTERVAL_KEY,
          value: '30',
        },
      ])
      .withErrors([])
      .build();
  }

  function aGetPropertiesRequest() {
    return new GetPropertiesRequestDTOBuilder()
      .withCustomProperties([
        { propertyName: BookingPolicyProperty.CANCELLATION_POLICY_KEY },
      ])
      .build();
  }

  it('should get business info', async () => {
    const resourcesServerStub = ambassadorServer.createStub(ResourcesServer);
    const grpcInfoViewResponse = aGetInfoViewResponse();
    const getPropertiesResponseDTOBuilder = aGetPropertiesResponse();
    ambassadorServer
      .createStub(NotificationsServer)
      .NotificationsSettings()
      .get.when(() => true)
      .resolve(
        aGetSetupResponse()
          .withNotifications([
            aNotification()
              .withType(NotificationType.REMINDER_EMAIL)
              .build(),
          ])
          .build(),
      );
    resourcesServerStub
      .ResourcesService()
      .list.when(() => true)
      .resolve(
        aListResourcesResponse()
          .withResources([
            aResource()
              .withSchedules([
                aSimpleSchedule([aNineToFiveInterval.bind(null, 'SUN')]),
              ])
              .build(),
          ])
          .build(),
      );

    ambassadorServer
      .createStub(BusinessServer)
      .Business()
      .getInfo.when(() => true)
      .resolve(grpcInfoViewResponse);

    ambassadorServer
      .createStub(BusinessServer)
      .Business()
      .getProperties.when(() => true)
      .resolve(aGetPropertiesResponse());

    const res = await axios(app.getUrl('/owner/business'));
    const businessInfo = res.data;
    expect(businessInfo.name).toEqual(grpcInfoViewResponse.name);
    expect(businessInfo.language).toEqual(grpcInfoViewResponse.language);
    expect(businessInfo.phone).toEqual(grpcInfoViewResponse.phone);
    expect(businessInfo.timeZone).toEqual(grpcInfoViewResponse.timeZone);
    expect(businessInfo.formattedAddress).toEqual(
      grpcInfoViewResponse.formattedAddress,
    );
    expect(businessInfo.cancellationPolicy).toEqual(
      getPropertiesResponseDTOBuilder.customProperties[0].value,
    );
  });

  it('should get business timezone', async () => {
    const bookingsBusinessServerStub = ambassadorServer.createStub(
      BusinessServer,
    );
    const businessInfoResponse = aGetInfoViewResponse();
    bookingsBusinessServerStub
      .Business()
      .getInfo.when(() => true)
      .resolve(businessInfoResponse);
    const res = await axios(app.getUrl('/crm/business/timezone'));
    expect(res.data.timeZone).toBe(businessInfoResponse.timeZone);
  });

  it('should update business info', async () => {
    const bookingsBusinessServerStub = ambassadorServer.createStub(
      BusinessServer,
    );
    bookingsBusinessServerStub
      .Business()
      .getProperties.when(() => true)
      .resolve(aGetPropertiesResponse());
    bookingsBusinessServerStub
      .Business()
      .updateProperties.when(() => true)
      .resolve(anUpdatePropertiesResponse().build());
    const notificationsServerStub = ambassadorServer.createStub(
      NotificationsServer,
    );
    const resourcesServerStub = ambassadorServer.createStub(ResourcesServer);
    resourcesServerStub
      .ResourcesService()
      .update.when(() => true)
      .resolve(anUpdateResourceResponse().build());
    resourcesServerStub
      .ResourcesService()
      .list.when(() => true)
      .resolve(
        aListResourcesResponse()
          .withResources([aBusinessResource()])
          .build(),
      );
    notificationsServerStub
      .NotificationsSettings()
      .setup.when(() => true)
      .resolve(aSetupResponse().build());
    const businessInfo = createBusinessInfo();
    const servicesServerStub = ambassadorServer.createStub(ServicesServer);
    // servicesServerStub
    //   .ServicesService()
    //   .batchUpdate.when(() => true)
    //   .resolve(aBatchUpdateResponse().build());

    servicesServerStub
      .ServicesService()
      .update.when(() => true)
      .resolve(anUpdateServiceResponse().build());

    ambassadorServer
      .createStub(ServicesCatalogServer)
      .ServicesCatalog()
      .list.when(() => true)
      .resolve(
        aListServicesResponse()
          .withServices([
            aGetServiceResponse()
              .withSchedules(null)
              .withUrls(null)
              .withPricingPlans(null)
              .withForm(null)
              .withService(
                TestService()
                  .withPolicy(aBookingPolicy().build())
                  .build(),
              )
              .build(),
          ])
          .build(),
      );

    const res = await axios.put(app.getUrl('/owner/business'), businessInfo);

    expect(res).toBeDefined();
  });
});
