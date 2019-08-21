import {
  aGetServiceResponse,
  aListServicesResponse,
  aPrice,
  aRate,
  aSchedule,
  aService,
  aServiceInfo,
} from '@wix/ambassador-services-catalog-server/builders';
import { ServicesCatalogServer } from '@wix/ambassador-services-catalog-server/rpc';
import axios from 'axios';

describe('coupons', () => {
  const numberOfServices = 3;
  function stubCatalogService() {
    const someServiceInfo = aServiceInfo().build();
    const someService = aService()
      .withInfo(someServiceInfo)
      .build();
    const somePrice = aPrice().build();
    const someRate = aRate()
      .withLabeledPriceOptions({ general: somePrice })
      .build();
    const someSchedule = aSchedule()
      .withRate(someRate)
      .build();

    const catalogServer = ambassadorServer.createStub(ServicesCatalogServer);
    const response = aListServicesResponse()
      .withServices(
        new Array(numberOfServices).fill(
          aGetServiceResponse()
            .withService(someService)
            .withSchedules([someSchedule])
            .build(),
        ),
      )
      .build();

    catalogServer
      .ServicesCatalog()
      .list.when(() => true)
      .resolve(response);
  }

  it('should get all coupon eligible services', async () => {
    stubCatalogService();
    const someLimit = 500;
    const someOffset = 0;
    const res = await axios.get(
      app.getUrl(
        `/owner/coupons/services?paging.limit=${someLimit}&paging.offset=${someOffset}`,
      ),
    );

    expect(res.status).toBe(200);
    expect(res.data.services.length).toBe(numberOfServices);
  });
});
