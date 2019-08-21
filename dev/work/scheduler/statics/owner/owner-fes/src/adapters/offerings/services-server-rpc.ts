import {
  BatchUpdateCategoryRequest,
  BatchUpdateRequest,
  BatchUpdateResponse,
  CreateCategoryRequest,
  CreateServiceRequest,
  CreateServiceResponse,
  DeleteServiceRequest,
  DeleteServiceResponse,
  ListCategoryResponse,
  Service,
  ServicesServer,
  UpdateCategoryRequest,
  UpdateCategoryResponse,
  UpdateServiceRequest,
  UpdateServiceResponse,
} from '@wix/ambassador-services-server';
import { makeLogged } from '../rpc-executor';
import { GetServiceResponse } from '@wix/ambassador-services-catalog-server/rpc';

export function servicesBookingPolicyBatchUpdater(
  aspects,
): ([]) => Promise<BatchUpdateResponse> {
  const servicesService = ServicesServer().ServicesService()(aspects);

  return async (services: Service[]): Promise<BatchUpdateResponse> => {
    const request: BatchUpdateRequest = {
      services,
      fieldMask: {
        paths: [
          'policy.bookUpToXMinutesBefore',
          'policy.cancelRescheduleUpToXMinutesBefore',
        ],
      },
    };

    return makeLogged(servicesService.batchUpdate)(request);
  };
}

export function servicesBookingPolicyUpdater(aspects) {
  const servicesService = ServicesServer().ServicesService()(aspects);

  return async (
    serviceResponses: GetServiceResponse[],
  ): Promise<UpdateServiceResponse[]> => {
    const allUpdatePromises = [];
    serviceResponses.forEach(serviceResponse => {
      const updateServiceRequest: UpdateServiceRequest = {
        service: serviceResponse.service,
        schedules: serviceResponse.schedules,
        notifyParticipants: false,
      };

      allUpdatePromises.push(
        makeLogged(servicesService.update)(updateServiceRequest),
      );
    });

    return Promise.all(allUpdatePromises);
  };
}

function getRpcService(aspects) {
  return ServicesServer().ServicesService()(aspects);
}

export function updaterOfOfferingsOrderFactory(aspects) {
  const rpcService = getRpcService(aspects);
  return async (services: Service[]) => {
    const request: BatchUpdateRequest = {
      services,
      fieldMask: { paths: ['customProperties', 'categoryId'] },
    };
    return rpcService.batchUpdate(request);
  };
}

export function updaterOfCategoriesOrderFactory(aspects) {
  const categoriesService = ServicesServer().CategoriesService()(aspects);
  return async categories => {
    const request: BatchUpdateCategoryRequest = {
      categories,
      fieldMask: { paths: ['customProperties'] },
    };
    return makeLogged(categoriesService.batchUpdate)(request);
  };
}

export function createOfferingFactory(
  aspects,
): (CreateServiceRequest) => Promise<CreateServiceResponse> {
  const servicesService = ServicesServer().ServicesService();
  return async (
    request: CreateServiceRequest,
  ): Promise<CreateServiceResponse> => {
    return makeLogged(servicesService(aspects).create)(request);
  };
}

export function updateOfferingFactory(
  aspects,
): (UpdateServiceRequest) => Promise<UpdateServiceResponse> {
  const servicesService = ServicesServer().ServicesService();
  return async (
    request: UpdateServiceRequest,
  ): Promise<UpdateServiceResponse> => {
    return makeLogged(servicesService(aspects).update)(request);
  };
}

export function deleterOfOfferingFactory(aspects: any) {
  const serviceService = ServicesServer().ServicesService();
  return (req: DeleteServiceRequest): Promise<DeleteServiceResponse> =>
    makeLogged(serviceService(aspects).delete)(req);
}

export function createCategoryFactory(aspects) {
  const categoryService = ServicesServer().CategoriesService()(aspects);

  return (request: CreateCategoryRequest) => {
    return makeLogged(categoryService.create)(request);
  };
}

export function categoryUpdater(
  aspects,
): (UpdateCategoryRequest) => Promise<UpdateCategoryResponse> {
  const categoryService = ServicesServer().CategoriesService();

  return (request: UpdateCategoryRequest): Promise<UpdateCategoryResponse> =>
    categoryService(aspects).update(request);
}
//
export function deleterOfCategoryFactory(aspects) {
  const categoryService = ServicesServer().CategoriesService();
  return async categoryId =>
    makeLogged(categoryService(aspects).delete)({ id: categoryId });
}

export function getCategoriesListFactory(
  aspects,
): () => Promise<ListCategoryResponse> {
  const categoriesService = ServicesServer().CategoriesService()(aspects);

  return () => {
    return makeLogged(categoriesService.list)({}); // todo this filter should be changed by Yasha
  };
}
