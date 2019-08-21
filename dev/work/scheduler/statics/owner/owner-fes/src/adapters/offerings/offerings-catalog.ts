import {
  GetterOfferingsList,
  getterOfferingsListFactory,
} from './services-catalog-rpc';
import { ListResourcesResponse } from '@wix/ambassador-resources-server/rpc';
import {
  CreateServiceRequest,
  CreateServiceResponse,
  DeleteServiceRequest,
  DeleteServiceResponse,
  Service,
  UpdateServiceRequest,
  UpdateServiceResponse,
} from '@wix/ambassador-services-server';
import {
  GetServiceResponse,
  ListServicesResponse,
} from '@wix/ambassador-services-catalog-server/rpc';
import {
  convertOfferingToOrderedService,
  convertOfferingToServiceRequest,
  convertOfferingToUpdateServiceRequest,
} from '../mappers/offering/offering-to-service';
import {
  convertOfferingCategoryToServiceCategory,
  convertServiceCategoryToOfferingCategory,
  convertServiceToOffering,
  getOfferingTypeFromSchedules,
} from '../mappers/offering/service-to-offering';
import { SessionOffering } from '../mappers/calendar/sessions-to-calendar';
import { IndividualOfferingDto } from '../../dto/offerings/individual-offering.dto';
import { GroupOfferingDto } from '../../dto/offerings/group-offering.dto';
import { CourseOfferingDto } from '../../dto/offerings/course-offering.dto';
import {
  AddResourcesResponse,
  BenefitWithPlanInfo,
  BulkDeleteResourcesResponse,
  DeleteResourcesResponse,
  LinkedResource,
  ListResponse,
} from '@wix/ambassador-pricing-plan-benefits-server';
import { OfferedAsType } from '../../dto/offerings/offering.dto';
import { getterOfBusinessResourceFactory } from '../resources/resources-adapter-rpc';
import * as moment from 'moment';
import {
  OfferingTypes,
  OfferingsConst,
} from '../../dto/offerings/offerings.consts';
import {
  GetPropertiesResponse,
  GetInfoViewResponse,
} from '@wix/ambassador-business-server';
import { mapCustomPropertiesToMap } from '../mappers/custom-properties/custom-properties-to-map-mapper';
import { getCategoriesListFactory } from './services-server-rpc';

export async function createAnOffering(
  offering: IndividualOfferingDto | GroupOfferingDto | CourseOfferingDto,
  getOfAllStaffAsResource: () => Promise<ListResourcesResponse>,
  getOfServicesList: GetterOfferingsList,
  getBusinessProperties: () => Promise<GetPropertiesResponse>,
  getBusinessInfoView: () => Promise<GetInfoViewResponse>,
  createOffering: (CreateServiceRequest) => Promise<CreateServiceResponse>,
  experiments: { [key: string]: string },
) {
  const [
    listResourcesResponse,
    servicesListResponse,
    businessProperties,
    businessInfo,
  ] = await Promise.all([
    getOfAllStaffAsResource(),
    getOfServicesList(false),
    getBusinessProperties(),
    getBusinessInfoView(),
  ]);

  const servicesCount = servicesListResponse.services
    ? servicesListResponse.services.length
    : 0;

  updatePastOffering(offering);

  const createRequest: CreateServiceRequest = convertOfferingToServiceRequest(
    offering,
    listResourcesResponse.resources,
    null,
    servicesCount,
    mapCustomPropertiesToMap(businessProperties.customProperties),
    businessInfo.timeZone,
    experiments,
  );

  return createOffering(createRequest);
}

function updatePastOffering(
  offering: IndividualOfferingDto | GroupOfferingDto | CourseOfferingDto,
) {
  if (offering.type !== OfferingTypes.COURSE) {
    return;
  }

  const startDate = moment(offering.schedule.startDate);
  const today = moment().startOf('day');
  if (today.diff(startDate) > 0) {
    const futureStartDate = moment()
      .add(1, 'months')
      .format(OfferingsConst.DATE_FORMAT);

    const futureEndDate = moment()
      .add(2, 'months')
      .format(OfferingsConst.DATE_FORMAT);

    offering.schedule.startDate = futureStartDate;
    offering.schedule.endDate = futureEndDate;
  }
}

export async function updateAnOffering(
  offering: IndividualOfferingDto | GroupOfferingDto | CourseOfferingDto,
  notifyUsers: string,
  getServiceById: (string) => Promise<GetServiceResponse>,
  getterOfAllStaffAsResource: () => Promise<ListResourcesResponse>,
  getBusinessProperties: () => Promise<GetPropertiesResponse>,
  getBusinessInfoView: () => Promise<GetInfoViewResponse>,
  updaterOfOffering: (UpdateServiceRequest) => Promise<UpdateServiceResponse>,
  experiments: { [keu: string]: string },
) {
  const currentGetServiceResponse = await getServiceById(offering.id);

  const scheduleId = currentGetServiceResponse.service.scheduleIds[0];
  const order = +currentGetServiceResponse.service.customProperties.order; // we don't change order

  const [
    listResourcesResponse,
    businessProperties,
    businessInfo,
  ] = await Promise.all([
    getterOfAllStaffAsResource(),
    getBusinessProperties(),
    getBusinessInfoView(),
  ]);

  cleanOffering(offering);
  const updateRequest: UpdateServiceRequest = convertOfferingToUpdateServiceRequest(
    offering,
    notifyUsers === 'true',
    listResourcesResponse.resources,
    scheduleId,
    order,
    mapCustomPropertiesToMap(businessProperties.customProperties),
    businessInfo.timeZone,
    experiments,
  );

  return updaterOfOffering(updateRequest);
}

function cleanOffering(
  offering: IndividualOfferingDto | GroupOfferingDto | CourseOfferingDto,
) {
  if (
    offering.offeredAs.length === 1 &&
    offering.offeredAs[0] === OfferedAsType.PRICING_PLAN
  ) {
    offering.payment.price = null;
    offering.payment.minCharge = null;
  }
}

export async function addNewOfferingToPlans(
  offering: IndividualOfferingDto | GroupOfferingDto | CourseOfferingDto,
  getterOfBenefitsWithPlans: ([]) => Promise<ListResponse>,
  adderOfServiceToPlans: (AddResourcesRequest) => Promise<AddResourcesResponse>,
) {
  if (
    offering.pricingPlanInfo.pricingPlans.length === 0 ||
    offering.offeredAs.indexOf(OfferedAsType.PRICING_PLAN) === -1
  ) {
    return;
  }

  const updatedPlanIds = offering.pricingPlanInfo.pricingPlans.map(
    plan => plan.id,
  );
  const planListResponse = await getterOfBenefitsWithPlans(updatedPlanIds);

  const plansAsResources = planListResponse.benefitsWithPlanInfo.map(BwP =>
    benefitWithPlanInfoToLinkedResource(BwP, offering.id),
  );

  return adderOfServiceToPlans({ resources: plansAsResources });
}

export async function updatePlansForOffering(
  offering: IndividualOfferingDto | GroupOfferingDto | CourseOfferingDto,
  getterOfBenefitsWithPlans: ([]) => Promise<ListResponse>,
  getterOfBenefitListByOffering: (string) => Promise<ListResponse>,
  adderOfServiceToPlans: (AddResourcesRequest) => Promise<AddResourcesResponse>,
  deleterOfServiceFromPlans: (
    offeringId: string,
  ) => Promise<DeleteResourcesResponse>,
  bulkDeleterOfServiceFromPlans: (
    BulkDeleteResourcesRequest,
  ) => Promise<BulkDeleteResourcesResponse>,
): Promise<any> {
  if (
    offering.offeredAs.indexOf(OfferedAsType.PRICING_PLAN) === -1 ||
    offering.pricingPlanInfo.pricingPlans.length === 0
  ) {
    const res = await deleterOfServiceFromPlans(offering.id);
    return res;
  }

  const updatedPlanIds = offering.pricingPlanInfo.pricingPlans.map(
    plan => plan.id,
  );
  const [newPlanListResponse, oldPlanListResponse] = await Promise.all([
    getterOfBenefitsWithPlans(updatedPlanIds),
    getterOfBenefitListByOffering(offering.id),
  ]);

  const oldPlanList = oldPlanListResponse.benefitsWithPlanInfo
    ? oldPlanListResponse.benefitsWithPlanInfo
    : [];
  const newPlanList = newPlanListResponse.benefitsWithPlanInfo
    ? newPlanListResponse.benefitsWithPlanInfo
    : [];

  return Promise.all([
    addToSpecificPlans(
      oldPlanList,
      newPlanList,
      offering.id,
      adderOfServiceToPlans,
    ),
    removeFromSpecificPlans(
      oldPlanList,
      newPlanList,
      offering.id,
      bulkDeleterOfServiceFromPlans,
    ),
  ]);
}

async function removeFromSpecificPlans(
  oldPlans: BenefitWithPlanInfo[],
  newPlans: BenefitWithPlanInfo[],
  offeringId: string,
  bulkDeleterOfServiceFromPlans: (
    BulkDeleteResourcesRequest,
  ) => Promise<BulkDeleteResourcesResponse>,
) {
  const benefitsWithPlansToRemove: BenefitWithPlanInfo[] = plansInListAButNotB(
    oldPlans,
    newPlans,
  );

  if (benefitsWithPlansToRemove.length) {
    const benefitsToRemoveAsLinkedResources: LinkedResource[] = benefitsWithPlansToRemove.map(
      BwP => benefitWithPlanInfoToLinkedResource(BwP, offeringId),
    );
    return bulkDeleterOfServiceFromPlans({
      resources: benefitsToRemoveAsLinkedResources,
    });
  }
}

async function addToSpecificPlans(
  oldPlans: BenefitWithPlanInfo[],
  newPlans: BenefitWithPlanInfo[],
  offeringId: string,
  adderOfServiceToPlans: (AddResourcesRequest) => Promise<AddResourcesResponse>,
) {
  const benefitsWithPlansToAdd: BenefitWithPlanInfo[] = plansInListAButNotB(
    newPlans,
    oldPlans,
  );

  if (benefitsWithPlansToAdd.length) {
    const benefitsToAddAsLinkedResources: LinkedResource[] = benefitsWithPlansToAdd.map(
      BwP => benefitWithPlanInfoToLinkedResource(BwP, offeringId),
    );
    return adderOfServiceToPlans({ resources: benefitsToAddAsLinkedResources });
  }
}

function plansInListAButNotB(
  plansFoundIn: BenefitWithPlanInfo[],
  butNotIn: BenefitWithPlanInfo[],
): BenefitWithPlanInfo[] {
  return plansFoundIn.filter(candidatePlan => {
    return (
      candidatePlan.benefit &&
      candidatePlan.benefit.id &&
      butNotIn.findIndex(BwP => BwP.benefit.id === candidatePlan.benefit.id) ===
        -1
    );
  });
}

function benefitWithPlanInfoToLinkedResource(
  benefitWithPlan: BenefitWithPlanInfo,
  offeringId: string,
): LinkedResource {
  return {
    planId: benefitWithPlan.planInfo.id,
    benefitId: benefitWithPlan.benefit.id,
    resourceId: offeringId,
  };
}

export async function deleteAnOffering(
  deleterOfOffering: (
    request: DeleteServiceRequest,
  ) => Promise<DeleteServiceResponse>,
  getterOfServiceById: (string) => Promise<GetServiceResponse>,
  offeringId: string,
  notifyParticipants: boolean,
) {
  const { schedules } = await getterOfServiceById(offeringId);
  const preserveFutureSessionsWithParticipants =
    getOfferingTypeFromSchedules(schedules) === OfferingTypes.INDIVIDUAL;
  const req: DeleteServiceRequest = {
    id: offeringId,
    notifyParticipants,
    preserveFutureSessionsWithParticipants,
  };
  return deleterOfOffering(req);
}

export async function offeringsByScheduleId(
  aspects,
  includeDeleted = false,
): Promise<Map<string, SessionOffering>> {
  const res: ListServicesResponse = await getterOfferingsListFactory(aspects)(
    includeDeleted,
  );
  const offerings = !res.services
    ? new Map()
    : res.services.reduce((result, serviceResponse) => {
        if (!serviceResponse.schedules || !serviceResponse.schedules[0]) {
          return result;
        }

        const service = serviceResponse.service;
        result[service.scheduleIds[0]] = {
          id: serviceResponse.service.id,
          name: service.info.name,
          uouHidden: service.customProperties.uouHidden === 'true',
        };

        return result;
      }, new Map());

  console.log('LOG::offering list');
  console.log(JSON.stringify(offerings));
  return offerings;
}

function getOrder(orderable) {
  const maxOrder = 10000; //todo is it enough ?...
  return orderable &&
    orderable.customProperties &&
    orderable.customProperties.order
    ? +orderable.customProperties.order
    : maxOrder;
}

function sortServices(service1, service2) {
  const categoryDiff =
    getOrder(service1.category) - getOrder(service2.category);

  if (categoryDiff !== 0) {
    return categoryDiff;
  }

  return getOrder(service1.service) - getOrder(service2.service);
}

function reduceCategories(array, service) {
  if (
    array.filter(category => service.category.id === category.id).length === 0
  ) {
    array.push(service.category);
  }
  return array;
}

export async function getOfferingsAndCategories(aspects) {
  const categoryListPromise = getCategoriesListFactory(aspects);
  const listServicesPromise = getterOfferingsListFactory(aspects);
  const businessResourcePromise = getterOfBusinessResourceFactory(aspects);
  const [
    categoriesListResponse,
    offeringListResponse,
    businessResource,
  ] = await Promise.all([
    categoryListPromise(),
    listServicesPromise(false),
    businessResourcePromise(),
  ]);

  const services = offeringListResponse.services
    ? offeringListResponse.services
        .sort(sortServices)
        .map((getServiceResponse: GetServiceResponse) => {
          return convertServiceToOffering(
            getServiceResponse,
            businessResource.schedules[0],
          );
        })
    : [];

  const categories = categoriesListResponse.categories
    ? categoriesListResponse.categories
        .map(category => convertServiceCategoryToOfferingCategory(category))
        .sort((a, b) => a.order - b.order)
    : [];

  return {
    categories,
    offerings: services,
  };
}

export async function getOfferingById(
  offeringId,
  getServiceById: (offeringId: string) => Promise<any>,
  getterOfBusinessResource: () => Promise<any>,
) {
  const [getServiceResponse, businessResource] = await Promise.all([
    getServiceById(offeringId),
    getterOfBusinessResource(),
  ]);
  return convertServiceToOffering(
    getServiceResponse,
    businessResource.schedules[0],
  );
}

async function getOfferingScheduleId(
  OfferingPromise: Promise<GetServiceResponse>,
) {
  const res: GetServiceResponse = await OfferingPromise;
  return res.schedules ? res.schedules[0].id : null;
}

export async function updateListOrder(
  offeringsList,
  updaterOfOfferingsOrder: (services: Service[]) => Promise<any>,
  updaterOfCategoriesOrder: (categories) => Promise<any>,
) {
  const categories = [];
  const services = [];
  offeringsList.forEach(category => {
    categories.push(convertOfferingCategoryToServiceCategory(category));

    category.offerings.forEach(offering => {
      services.push(convertOfferingToOrderedService(offering, category.id));
    });
  });
  const offeringRes = await updaterOfOfferingsOrder(services);
  const categoriesRes = await updaterOfCategoriesOrder(categories);
  return offeringRes && categoriesRes;
}
