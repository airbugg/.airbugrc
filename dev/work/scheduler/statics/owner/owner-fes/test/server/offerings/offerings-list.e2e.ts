import axios from 'axios';
import {
  GetServiceResponse,
  ServicesCatalogServer,
  ListServicesResponse,
} from '@wix/ambassador-services-catalog-server/rpc';
import { getOfferingsAndCategories } from '../../../src/adapters/offerings/offerings-catalog';
import {
  aListServicesResponse,
  aService,
  aGetServiceResponse,
  aServiceInfo,
  anImage,
  aBookingPolicy,
  aPaymentOptions,
  aCategory,
} from '@wix/ambassador-services-catalog-server/builders';

import { Chance } from 'chance';
import {
  convertServiceToOffering,
  convertServiceCategoryToOfferingCategory,
} from '../../../src/adapters/mappers/offering/service-to-offering';
import { ServicesServer, Category } from '@wix/ambassador-services-server/rpc';
import { aListCategoryResponse } from '@wix/ambassador-services-server/builders';
import { categoriesList } from '../../../src/adapters/offerings/category/category';
import { aBusinessResource } from '../../builders/rpc-custom/resource-builder';
import { ResourcesServer } from '@wix/ambassador-resources-server/rpc';
import {
  aListResourcesResponse,
  aResource,
} from '@wix/ambassador-resources-server/builders';
import { getCategoriesListFactory } from '../../../src/adapters/offerings/services-server-rpc';
import { createListServicesRequest } from '../../../src/adapters/offerings/services-catalog-rpc';

const chance = new Chance();

function getUnique(arr, comp) {
  const unique = arr
    .map(e => e[comp])

    // store the keys of the unique objects
    .map((e, i, final) => final.indexOf(e) === i && i)

    // eliminate the dead keys & store unique objects
    .filter(e => arr[e])
    .map(e => arr[e]);

  return unique;
}

function stubServiceCatalog(
  serviceResponses: GetServiceResponse[],
  emptyCategories: Category[] = [],
) {
  const categoriesWithDuplicates: Category[] = serviceResponses.map(
    serviceResponse => serviceResponse.category,
  );
  const categories = getUnique(categoriesWithDuplicates, 'id').concat(
    emptyCategories,
  );
  const listServicesRequest = createListServicesRequest(false);
  ambassadorServer
    .createStub(ServicesCatalogServer)
    .ServicesCatalog()
    .list.when(listServicesRequest)
    .resolve(
      aListServicesResponse()
        .withServices(serviceResponses)
        .build(),
    );
  ambassadorServer
    .createStub(ServicesServer)
    .CategoriesService()
    .list.when(() => true)
    .resolve(
      aListCategoryResponse()
        .withCategories(categories)
        .build(),
    );
}

function TestService() {
  return aService()
    .withId(chance.guid())
    .withCustomProperties({
      order: `${chance.integer()}`,
      type: chance.string(),
    })
    .withInfo(
      aServiceInfo()
        .withDescription(chance.string())
        .withName(chance.string())
        .withTagLine(chance.string())
        .withImages([
          anImage()
            .withUrl(chance.string())
            .build(),
        ])
        .build(),
    )
    .withPolicy(
      aBookingPolicy()
        .withIsBookOnlineAllowed(true)
        .withMaxParticipantsPerBooking(chance.integer())
        .build(),
    )
    .withPaymentOptions(aPaymentOptions().build())
    .withCategoryId(chance.guid());
}

function TestServiceResponse(service = TestService().build()) {
  return aGetServiceResponse()
    .withResources([aResource().build()])
    .withService(service)
    .withCategory(
      aCategory()
        .withId(service.categoryId)
        .build(),
    );
}

function createServiceWithOrder(id: string, category: Category, order: number) {
  return TestServiceResponse()
    .withCategory(category)
    .withService(
      TestService()
        .withCustomProperties({ order: `${order}` })
        .withId(id)
        .withCategoryId(category.id)
        .build(),
    )
    .build();
}

function createCategoryWithOrder(id: string, order: number) {
  return aCategory()
    .withCustomProperties({ order: `${order}` })
    .withId(id)
    .build();
}

function createCategoriesAndServicesByOrder(list) {
  const services = [];
  list.categories.forEach(category => {
    let serviceService;
    const serviceCategory = createCategoryWithOrder(
      category.id,
      category.order,
    );
    category.services.forEach(service => {
      serviceService = createServiceWithOrder(
        service.id,
        serviceCategory,
        service.order,
      );

      services.push(serviceService);
    });
  });
  return services;
}

function categoriesForOrder() {
  return [
    {
      id: 'category-1',
      order: 0,
      offerings: [
        {
          id: 'offering-11',
          order: 0,
        },
        {
          id: 'offering-12',
          order: 1,
        },
      ],
    },
    {
      id: 'category-2',
      order: 1,
      offerings: [
        {
          id: 'offering-21',
          order: 0,
        },
        {
          id: 'offering-22',
          order: 1,
        },
      ],
    },
  ];
}

function stubGetBusinessResource() {
  const response = aListResourcesResponse()
    .withResources([aBusinessResource()])
    .build();
  ambassadorServer
    .createStub(ResourcesServer)
    .ResourcesService()
    .list.when(() => true)
    .resolve(response);
}

describe('OfferingsList', () => {
  it('returns offerings list', async () => {
    const serviceResponse = TestServiceResponse()
      .withCategory(aCategory().build())
      .build();
    stubServiceCatalog([serviceResponse]);
    stubGetBusinessResource();
    const serviceList = await getOfferingsAndCategories({});
    expect(serviceList.offerings.length).toBe(1);
  });

  it('returns a sorted offerings list', async () => {
    const servicesList = {
      categories: [
        {
          id: 'second-category',
          order: 1,
          services: [
            { id: 'second-service', order: 1 },
            { id: 'first-service', order: 0 },
          ],
        },
        {
          id: 'first-category',
          order: 0,
          services: [
            { id: 'second-service', order: 1 },
            { id: 'first-service', order: 0 },
          ],
        },
      ],
    };

    const responseServices = createCategoriesAndServicesByOrder(servicesList);
    stubServiceCatalog(responseServices);
    stubGetBusinessResource();
    const serviceList = await getOfferingsAndCategories({});
    expect(serviceList.categories.length).toBe(2);
    expect(serviceList.categories[0].id).toBe('first-category');
    expect(serviceList.categories[1].id).toBe('second-category');
    expect(serviceList.offerings.length).toBe(4);
    expect(serviceList.offerings[0].id).toBe('first-service');
    expect(serviceList.offerings[1].id).toBe('second-service');
  });

  it('calls offerings list change order rpc', async () => {
    const onServiceOrderCalled = jest.fn();
    const onCategoryOrderCalled = jest.fn();

    ambassadorServer
      .createStub(ServicesServer)
      .ServicesService()
      .batchUpdate.when(request => true)
      .call(onServiceOrderCalled);

    ambassadorServer
      .createStub(ServicesServer)
      .CategoriesService()
      .batchUpdate.when(request => true)
      .call(onCategoryOrderCalled);
    stubGetBusinessResource();
    const res = await axios.put(app.getUrl(`/owner/offerings/order`), {
      categories: categoriesForOrder(),
    });

    expect(onServiceOrderCalled).toHaveBeenCalledTimes(1);
    expect(onCategoryOrderCalled).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(200);
  });

  it('calls offerings list rpc', async () => {
    const serviceResponse = TestServiceResponse()
      .withCategory(aCategory().build())
      .build();
    stubGetBusinessResource();
    stubServiceCatalog([serviceResponse]);
    const offerings = [
      convertServiceToOffering(
        serviceResponse,
        aBusinessResource().schedules[0],
      ),
    ];
    const categories = [
      {
        id: serviceResponse.category.id,
        name: serviceResponse.category.name,
        order: 0,
        type: 'SERVICE',
      },
    ];

    const res = await axios(app.getUrl(`/owner/offerings`));
    expect(res.status).toBe(200);
    expect(res.data.categories).toEqual(categories);
    expect(res.data.offerings).toEqual(offerings);
  });

  it('calls offerings list rpc and gets null as list', async () => {
    const servicesCatalogServer = ambassadorServer.createStub(
      ServicesCatalogServer,
    );
    stubGetBusinessResource();
    const listServicesRequest = createListServicesRequest(false);
    const response: ListServicesResponse = { services: null };
    servicesCatalogServer
      .ServicesCatalog()
      .list.when(listServicesRequest)
      .resolve(response);

    ambassadorServer
      .createStub(ServicesServer)
      .CategoriesService()
      .list.when(() => true)
      .resolve(aListCategoryResponse().build());

    const res = await axios(app.getUrl(`/owner/offerings`));
    expect(res.status).toBe(200);
    expect(res.data.offerings).toEqual([]);
  });

  it('shows empty categories in offerings list', async () => {
    const serviceCount: number = Chance().integer({ min: 1, max: 5 });
    const services: GetServiceResponse[] = Chance().n(
      TestServiceResponse,
      serviceCount,
    );
    stubGetBusinessResource();
    const emptyCategoryId = 'empty_category_id';
    const emptyCategory = aCategory()
      .withId(emptyCategoryId)
      .build();
    stubServiceCatalog(services, [emptyCategory]);
    stubGetBusinessResource();
    const res = await axios(app.getUrl(`/owner/offerings`));

    expect(res.data.categories.length).toEqual(serviceCount + 1);
    expect(
      res.data.categories.findIndex(c => c.id === emptyCategoryId),
    ).toBeGreaterThanOrEqual(0);
  });

  it('returns categories list', async () => {
    ambassadorServer
      .createStub(ServicesServer)
      .CategoriesService()
      .list.when(() => true)
      .resolve(
        aListCategoryResponse()
          .withCategories([aCategory().build()])
          .build(),
      );

    const categories = await categoriesList(getCategoriesListFactory({}));
    expect(categories.length).toBe(1);
  });

  it('calls categories list rpc', async () => {
    const categories = [aCategory().build()];
    const servicesServer = ambassadorServer.createStub(ServicesServer);
    servicesServer
      .CategoriesService()
      .list.when(() => true)
      .resolve(
        aListCategoryResponse()
          .withCategories(categories)
          .build(),
      );

    const res = await axios(app.getUrl(`/owner/categories`));
    expect(res.status).toBe(200);
    expect(res.data.categories).toEqual(
      categories.map(convertServiceCategoryToOfferingCategory),
    );
  });

  it('calls categories list rpc and gets null as list', async () => {
    const servicesServer = ambassadorServer.createStub(ServicesServer);
    const categories = null;
    servicesServer
      .CategoriesService()
      .list.when(() => true)
      .resolve(
        aListCategoryResponse()
          .withCategories(categories)
          .build(),
      );

    const res = await axios(app.getUrl(`/owner/categories`));
    expect(res.status).toBe(200);
    expect(res.data.categories).toEqual([]);
  });
});
