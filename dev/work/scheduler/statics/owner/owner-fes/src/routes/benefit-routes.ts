import { wrapAsync } from './index';
import {
  getEligibleServices,
  getBookingsBenefit,
  updateBookingsBenefit,
  getAllPlans,
  getPlansForSlot,
} from '../controllers/benefit-controller';
import { getEligibleServicesForPlan } from '../adapters/benefit/benefit-adapter';

export function setBenefitRoutes(app) {
  app.get(
    '/bookings/v1/pricingPlan/:pricingPlanId/eligibleServices',
    wrapAsync((req, res, next) => getEligibleServices(req, res)),
  );
  app.get(
    '/bookings/v1/pricingPlan/eligibleServices',
    wrapAsync((req, res, next) => getEligibleServices(req, res)),
  );

  app.get(
    `/bookings/v1/pricingPlan/:pricingPlanId/`,
    wrapAsync((req, res, next) => getBookingsBenefit(req, res)),
  );
  app.put(
    `/bookings/v1/pricingPlan/:pricingPlanId/`,
    wrapAsync((req, res, next) => updateBookingsBenefit(req, res)),
  );
  app.get(
    '/bookings/v1/pricingPlan',
    wrapAsync((req, res, next) => getAllPlans(req, res)),
  );
  app.put(
    `/bookings/v1/pricingPlan`,
    wrapAsync((req, res, next) => updateBookingsBenefit(req, res)),
  );

  app.get(
    `/bookings/v1/customer/:contactId/planForSlot/:offeringId/:slotStartTime`,
    wrapAsync((req, res, next) => getPlansForSlot(req, res)),
  );
}
