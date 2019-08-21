import {
  GetServiceResponse,
  ListServicesResponse,
  ListServicesRequest,
  Query,
  ServicesCatalogServer,
} from '@wix/ambassador-services-catalog-server/rpc';
import { makeLogged } from '../rpc-executor';

export function createListServicesRequest(
  includeDeleted: boolean,
): ListServicesRequest {
  return {
    query: {
      fields: null,
      fieldsets: null,
      sort: [],
      paging: {
        limit: 500,
      },
    },
    includeDeleted,
  };
}

export declare type GetterOfferingsList = (
  includeDeleted: boolean,
) => Promise<ListServicesResponse>;

export function getterOfferingsListFactory(aspects): GetterOfferingsList {
  const servicesCatalogService = ServicesCatalogServer().ServicesCatalog();
  return async (includeDeleted: boolean): Promise<ListServicesResponse> => {
    const listServicesRequest = createListServicesRequest(includeDeleted);
    return makeLogged(servicesCatalogService(aspects).list)(
      listServicesRequest,
    );
  };
}

export function getterOfServiceByIdFactory(
  aspects,
): (string) => Promise<GetServiceResponse> {
  const servicesCatalog = ServicesCatalogServer().ServicesCatalog()(aspects);
  return async serviceId => {
    return makeLogged(servicesCatalog.get)({ id: serviceId, fields: null });
  };
}

export function buildQueryForOfferingByType(offeringTypes: string): Query {
  const q: Query = {
    filter: `{"schedules.tags": {"$hasSome": [${offeringTypes}]}}` as any,
    fields: null,
    fieldsets: null,
    sort: null,
  };
  return q;
}

export function buildQueryOfServicesForStaff(staffId: string): Query {
  const q: Query = {
    filter: `{"resources.id": "${staffId}"}` as any,
    fields: null,
    fieldsets: null,
    sort: null,
  };
  return q;
}
export function buildQueryOfServicesByCategoryId(categoryId: string): Query {
  const q: Query = {
    filter: `{"category.id": "${categoryId}"}` as any,
    fields: null,
    fieldsets: null,
    sort: null,
  };
  return q;
}

export function getterOfServiceListByQueryFactory(aspects) {
  const servicesCatalog = getServicesCatalogServer(aspects);
  return async (query: Query) => {
    return servicesCatalog.list({ query, includeDeleted: false });
  };
}

export function getterOfServicesForStaffFactory(aspects) {
  const servicesCatalog = getServicesCatalogServer(aspects);
  return async (staffId): Promise<ListServicesResponse> => {
    const q = buildQueryOfServicesForStaff(staffId);
    return makeLogged(servicesCatalog.list)({ query: q });
  };
}

function getServicesCatalogServer(aspects) {
  return ServicesCatalogServer().ServicesCatalog()(aspects);
}
