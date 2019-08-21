import {
  addNewOfferingToPlans,
  createAnOffering,
  deleteAnOffering,
  getOfferingById,
  getOfferingsAndCategories,
  updateAnOffering,
  updateListOrder,
  updatePlansForOffering,
} from '../adapters/offerings/offerings-catalog';
import {
  getAllStaffAsResourceFactory,
  getterOfBusinessResourceFactory,
} from '../adapters/resources/resources-adapter-rpc';
import {
  getterOfServiceByIdFactory,
  getterOfferingsListFactory,
} from '../adapters/offerings/services-catalog-rpc';
import {
  addServiceToBenefitsFactory,
  bulkDeleteServiceFromBenefitsFactory,
  deleteServicesFromAllBenefitsFactory,
  getterOfBenefitsForOfferingFactory,
  getterOfBookingBenefitIdsFactory,
} from '../adapters/benefit/benefit-adapter-rpc';
import {
  createOfferingFactory,
  deleterOfOfferingFactory,
  updateOfferingFactory,
  updaterOfCategoriesOrderFactory,
  updaterOfOfferingsOrderFactory,
} from '../adapters/offerings/services-server-rpc';
import {
  getBusinessPropertiesFactory,
  getBusinessInfoViewFactory,
} from '../adapters/business/busniess-adapter-rpc';
import { updateOnBoarding } from './business-setup';
import { OfferedAsType } from '../dto/offerings/offering.dto';
import { convertOfferingToServiceRequest } from '../adapters/mappers/offering/offering-to-service';
import { mapCustomPropertiesToMap } from '../adapters/mappers/custom-properties/custom-properties-to-map-mapper';
import { conductAllScopesFactory } from '../adapters/petri/conduct-all-scopes';

export async function getOfferingsList(req, res, next) {
  const offeringList = await getOfferingsAndCategories(req.aspects);
  res.json(offeringList);
}

export async function getOffering(req, res, next) {
  const offeringId = req.params.id;
  const offering = await getOfferingById(
    offeringId,
    getterOfServiceByIdFactory(req.aspects),
    getterOfBusinessResourceFactory(req.aspects),
  );
  res.json(offering);
}

function alignADIOfferingRequest(offering: any) {
  offering.offeredAs = [OfferedAsType.ONE_TIME];
  offering.pricingPlanInfo = { pricingPlans: [] };
  return offering;
}

export async function bulkCreateOfferings(req, res, next, petri) {
  const offeringRequests = req.body;
  const experiments = await conductAllScopesFactory(req.aspects, petri)();
  const createList = offeringRequests.requests.map(offering => {
    offering = alignADIOfferingRequest(offering);
    return createSingleOfferings(offering, req.aspects, experiments);
  });
  const createRes = await Promise.all(createList);
  res.send(createRes);
}

async function createSingleOfferings(
  offering,
  aspects,
  experiments: { [key: string]: string },
) {
  const idResponse = await createAnOffering(
    offering,
    getAllStaffAsResourceFactory(aspects),
    getterOfferingsListFactory(aspects),
    getBusinessPropertiesFactory(aspects),
    getBusinessInfoViewFactory(aspects),
    createOfferingFactory(aspects),
    experiments,
  );
  offering.id = idResponse.id;
  await addNewOfferingToPlans(
    offering,
    getterOfBookingBenefitIdsFactory(aspects),
    addServiceToBenefitsFactory(aspects),
  );
  return idResponse;
}

export async function createOffering(req, res, next, petri) {
  const offering = req.body;
  const experiments = await conductAllScopesFactory(req.aspects, petri)();
  await updateOnBoarding(req.aspects, { servicesReviewed: true }); // should we await?
  const idResponse = await createSingleOfferings(
    offering,
    req.aspects,
    experiments,
  );
  res.json(idResponse);
}

export async function offeringsConverter(req, res, next, petri) {
  const offerings = req.body.offerings;
  const resources = req.body.resources;
  const servicesCount = req.body.servicesCount;
  const timeZone = req.body.timeZone;
  const customProperties = req.body.customProperties;
  const experiments = await conductAllScopesFactory(req.aspects, petri)();
  const createRequest = offerings.map(offering =>
    convertOfferingToServiceRequest(
      offering,
      resources,
      null,
      servicesCount,
      mapCustomPropertiesToMap(customProperties),
      timeZone,
      experiments,
    ),
  );
  res.json({ services: createRequest });
}

export async function updateOffering(req, res, next, petri) {
  const experiments = await conductAllScopesFactory(req.aspects, petri)();
  const [idResponse] = await Promise.all([
    updateAnOffering(
      req.body,
      req.query.notifyUsers,
      getterOfServiceByIdFactory(req.aspects),
      getAllStaffAsResourceFactory(req.aspects),
      getBusinessPropertiesFactory(req.aspects),
      getBusinessInfoViewFactory(req.aspects),
      updateOfferingFactory(req.aspects),
      experiments,
    ),
    updatePlansForOffering(
      req.body,
      getterOfBookingBenefitIdsFactory(req.aspects),
      getterOfBenefitsForOfferingFactory(req.aspects),
      addServiceToBenefitsFactory(req.aspects),
      deleteServicesFromAllBenefitsFactory(req.aspects),
      bulkDeleteServiceFromBenefitsFactory(req.aspects),
    ),
    updateOnBoarding(req.aspects, { servicesReviewed: true }), // should we await?
  ]);
  res.json(idResponse);
}

export async function deleteOffering(req, res, next) {
  const notifyUsers: boolean = req.query.notifyUsers === 'true';
  const response = await deleteAnOffering(
    deleterOfOfferingFactory(req.aspects),
    getterOfServiceByIdFactory(req.aspects),
    req.params.id,
    notifyUsers,
  );
  res.sendStatus(200);
}

export async function updateOfferingListOrder(req, res, next) {
  const result = await updateListOrder(
    req.body.categories,
    updaterOfOfferingsOrderFactory(req.aspects),
    updaterOfCategoriesOrderFactory(req.aspects),
  );
  res.sendStatus(200);
}
