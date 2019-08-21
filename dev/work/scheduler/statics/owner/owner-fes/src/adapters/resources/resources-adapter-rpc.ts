import {
  CreateResourceRequest,
  CreateResourceResponse,
  DeleteResourceResponse,
  ListResourcesRequest,
  ListResourcesResponse,
  Query,
  Resource,
  ResourcesServer,
  UpdateResourceResponse,
  Value,
} from '@wix/ambassador-resources-server/index';
import { makeLogged } from '../rpc-executor';
import { getStaffByUid } from '../staff';

export const BUSINESS_TAG = 'business';
export const STAFF_TAG = 'staff';
export const DEFAULT_STAFF_TAG = 'defaultStaff';

function createResourceService(aspects) {
  return ResourcesServer().ResourcesService()(aspects);
}

export function createResourceFactory(
  aspects,
): (resource: Resource) => Promise<CreateResourceResponse> {
  const service = createResourceService(aspects);
  return async (resource: Resource): Promise<CreateResourceResponse> => {
    const createResourceRequest: CreateResourceRequest = { resource };
    return makeLogged(service.create)(createResourceRequest);
  };
}

function createResourcesRequest(filter: string): ListResourcesRequest {
  const query: Query = {
    filter: filter as Value,
    fields: null,
    fieldsets: null,
    sort: null,
  };
  return {
    query,
  };
}

function resourceTagFilter(tag: string): string {
  return `{"$and" : [{"resource.tags": {"$hasSome" : ["${tag}"]}},  {"resource.status": {"$hasSome":  ["CREATED","UPDATED","DELETED"]}}]}`;
}

// function resourceStatusFilter(status: string): any {
//   return {'resource.status': status};
// }

function resourceIdFilter(ids: string[]): any {
  return `{"$and": [{"resource.id":{"$hasSome": ["${ids}"]}}, {"resource.status": {"$hasSome":["CREATED","DELETED","UPDATED"]}}]}`;
}

function getResourcesList(service, filter: string) {
  const request = createResourcesRequest(filter);
  return makeLogged(service.list)(request);
}

export function getAllStaffAsResourceFactory(
  aspects,
): () => Promise<ListResourcesResponse> {
  const service = createResourceService(aspects);
  return async (): Promise<ListResourcesResponse> => {
    return getResourcesList(service, resourceTagFilter(STAFF_TAG));
  };
}

export async function getResourceOfAUser(uid, aspects) {
  const staffOfCurrentUser = await getStaffByUid(uid, aspects);
  const getResourcesById = getterOfStaffByIdFactory(aspects);
  if (staffOfCurrentUser) {
    return getResourcesById([staffOfCurrentUser.id]);
  }
  return null;
}

export function getterOfStaffByIdFactory(aspects) {
  const service = createResourceService(aspects);
  return async (resourcesIds: string[]): Promise<ListResourcesResponse> => {
    return getResourcesList(service, resourceIdFilter(resourcesIds));
  };
}

export function getterOfBusinessResourceFactory(
  aspects,
): () => Promise<Resource> {
  const service = createResourceService(aspects);
  return async (): Promise<Resource> => {
    const resourcesResponse = await getResourcesList(
      service,
      //resourceIdFilter(["99daacdc-298e-4cf5-b7ab-3b1e9b053dff"])
      resourceTagFilter(BUSINESS_TAG),
    );
    return resourcesResponse.resources ? resourcesResponse.resources[0] : null;
  };
}

export function updaterOfResourceFactory(aspects) {
  const service = createResourceService(aspects);
  return async (resource: Resource): Promise<UpdateResourceResponse> => {
    return service.update({ resource });
  };
}

export function deleteResponseFactory(
  aspects,
): (responseId: string) => Promise<DeleteResourceResponse> {
  const service = createResourceService(aspects);
  return async (responseId: string): Promise<DeleteResourceResponse> => {
    return service.delete({ id: responseId });
  };
}
