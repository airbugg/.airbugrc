import axios from 'axios';
import { Chance } from 'chance';
import { CalendarServer } from '@wix/ambassador-calendar-server/rpc';
import { ScheduleServer } from '@wix/ambassador-schedule-server/rpc';
import {
  aListResourcesResponse,
  aResource,
  aSchedule,
} from '@wix/ambassador-resources-server/builders';
import { ResourcesServer } from '@wix/ambassador-resources-server/rpc';
import {
  aCategory,
  aGetServiceResponse,
  aListServicesResponse,
  aPaymentOptions,
  aService,
  aServiceInfo,
} from '@wix/ambassador-services-catalog-server/builders';
import { ServicesCatalogServer } from '@wix/ambassador-services-catalog-server/rpc';
import {
  aLinkedSchedule,
  aListSessionsResponse,
  aSession,
} from '@wix/ambassador-calendar-server/builders';

import { OfferingTypes } from '../../../src/dto/offerings/offerings.consts';

describe('Calendar', () => {
  const chance = new Chance();
  const serviceScheduleId = 'serviceScheduleId';
  const staffScheduleId = 'staffScheduleId';
  const serviceId = 'serviceId';
  const staffId = 'staffId';

  function stubSessionsService() {
    const calendarServer = ambassadorServer.createStub(CalendarServer);
    const oneSession = () =>
      aSession()
        .withAffectedSchedules([
          aLinkedSchedule()
            .withScheduleId(staffId)
            .build(),
        ])
        .withScheduleId(serviceScheduleId)
        .withTags([OfferingTypes.COURSE])
        .build();
    const response = aListSessionsResponse()
      .withSessions([oneSession()])
      .build();
    calendarServer
      .CalendarService()
      .listSessions.when(() => true)
      .resolve(response);
  }

  function stubSchedulesService() {
    ambassadorServer
      .createStub(ScheduleServer)
      .Schedules()
      .list.when(() => true)
      .resolve({
        schedules: [
          aSchedule()
            .withId(serviceScheduleId)
            .build(),
        ],
      });
  }

  function stubCatalogService() {
    const category = aCategory().build();
    const service = aService()
      .withPaymentOptions(aPaymentOptions().build())
      .withInfo(aServiceInfo().build())
      .withScheduleIds([serviceScheduleId])
      .withId(serviceId)
      .build();

    const catalogServer = ambassadorServer.createStub(ServicesCatalogServer);
    const response = aListServicesResponse()
      .withServices([
        aGetServiceResponse()
          .withService(service)
          .build(),
      ])
      .build();

    catalogServer
      .ServicesCatalog()
      .list.when(() => true)
      .resolve(response);
  }

  function stubResourceService() {
    const resourceServer = ambassadorServer.createStub(ResourcesServer);
    const response = aListResourcesResponse()
      .withResources([
        aResource()
          .withId(staffId)
          .build(),
      ])
      .build();

    resourceServer
      .ResourcesService()
      .list.when(() => true)
      .resolve(response);
  }

  it('calls calendar rpc', async () => {
    stubSessionsService();
    stubCatalogService();
    stubResourceService();
    stubSchedulesService();
    const start = 1544432400000;
    const end = 1545037199999;
    const res = await axios.get(app.getUrl(`/owner/sessions/${start}/${end}`));
    expect(res.status).toBe(200);
    expect(res.data.calendarItems.length).toBe(1);
  });
});
