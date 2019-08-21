import {
  AddResourcesRequest,
  AddResourcesResponse,
  Benefit,
  BulkDeleteResourcesRequest,
  BulkDeleteResourcesResponse,
  CreatePlanBenefitsRequest,
  DeleteResourcesRequest,
  PricingPlanBenefitsServer,
  UpdateBenefitsRequest,
} from '@wix/ambassador-pricing-plan-benefits-server';
import { BOOKINGS_APP_ID } from '../../app/apps-info';

export function getterOfBookingBenefitIdsFactory(aspects) {
  const service = getService(aspects);
  return async (planIds: string[]) => {
    return service.list({
      planIds,
      resourceIds: null,
      benefitIds: null,
      appDefIds: [BOOKINGS_APP_ID],
    });
  };
}

export function getterOfBenefitsForOfferingFactory(aspects) {
  const service = getService(aspects);
  return async (offeringId: string) => {
    return service.list({
      planIds: null,
      resourceIds: [offeringId],
      benefitIds: null,
      appDefIds: [BOOKINGS_APP_ID],
    });
  };
}

export function updaterOfBookingBenefitFactory(aspects) {
  const service = getService(aspects);
  return async (planId: string, benefit: Benefit) => {
    const request: UpdateBenefitsRequest = {
      benefits: [benefit],
      appDefId: BOOKINGS_APP_ID,
      planId,
    };
    return service.update(request);
  };
}

export function creatorOfBookingBenefitFactory(aspects) {
  const service = getService(aspects);
  return async (planId: string, benefit: Benefit) => {
    const createRequest: CreatePlanBenefitsRequest = {
      benefits: [benefit],
      appDefId: BOOKINGS_APP_ID,
      planId,
    };
    return service.createPlanBenefits(createRequest);
  };
}

export function getterOfAllPlansFactory(aspects) {
  const service = getService(aspects);
  return async () => {
    return service.list({
      planIds: null,
      resourceIds: null,
      benefitIds: null,
      appDefIds: [BOOKINGS_APP_ID],
    });
  };
}

export function deleteServicesFromAllBenefitsFactory(aspects) {
  const service = getService(aspects);
  return async (servicesId: string) => {
    const req: DeleteResourcesRequest = {
      resourceIds: { resourceIds: [servicesId] },
    };
    return service.deleteResources(req);
  };
}

export function bulkDeleteServiceFromBenefitsFactory(aspects) {
  const service = getService(aspects);
  return async (
    req: BulkDeleteResourcesRequest,
  ): Promise<BulkDeleteResourcesResponse> => {
    return service.bulkDeleteResources(req);
  };
}

export function addServiceToBenefitsFactory(aspects) {
  const service = getService(aspects);
  return async (req: AddResourcesRequest): Promise<AddResourcesResponse> => {
    return service.addResources(req);
  };
}

function getService(aspects: any) {
  return PricingPlanBenefitsServer().BenefitManagement()(aspects);
}
