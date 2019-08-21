import { Chance } from 'chance';
import axios from 'axios';
import { ServicesCatalogServer } from '@wix/ambassador-services-catalog-server/rpc';
import {
  aGetServiceResponse,
  aListServicesResponse,
  aService,
} from '@wix/ambassador-services-catalog-server/builders';
import { aServiceResponseWithPlan } from '../builders/rpc-custom/service';
import { UpdateBenefitsDTO } from '../../src/dto/pricing-plans/pricing-plan.dto';
import { createInstanceFrom } from './util/instance-generator';
import { PricingPlanBenefitsServer } from '@wix/ambassador-pricing-plan-benefits-server/rpc';
import { aListResponse } from '@wix/ambassador-pricing-plan-benefits-server/builders';
import {
  anyPlanInfo,
  combineBenefitWithPlanInfo,
  limitedBenefit,
} from '../builders/rpc-custom/benefit-with-plan';
import { anyUpdateBenefitDTO } from '../builders/dto/update-benefit.dto.builder';
import { CheckoutServer } from '@wix/ambassador-checkout-server/rpc';
import {
  aCheckoutOptions,
  aCheckoutOptionsResponse,
  aPaidPlan,
  aPaidPlans,
  aPlan,
} from '@wix/ambassador-checkout-server/builders';
import { aSchedule } from '@wix/ambassador-resources-server/builders';

const chance = Chance();
const instanceId = chance.guid();
let axiosInstance;
describe('eligibleServices service list for pricing plan', () => {
  beforeEach(() => {
    axiosInstance = axios.create({
      headers: {
        Authorization: createInstanceFrom({
          instanceId,
        }),
      },
    });
  });

  it('should return a list of service', async () => {
    const serviceResponses = [aServiceResponseWithPlan().build()];
    ambassadorServer
      .createStub(ServicesCatalogServer)
      .ServicesCatalog()
      .list.when(() => true)
      .resolve(
        aListServicesResponse()
          .withServices(serviceResponses)
          .build(),
      );

    const pricingPlanId: string = chance.guid();
    const res = await axiosInstance.get(
      app.getUrl(`/bookings/v1/pricingPlan/${pricingPlanId}/eligibleServices`),
    );
    expect(res.data.services.length).toBe(1);
  });

  it('list of plan', async () => {
    const plan = anyPlanInfo();
    const benefit = limitedBenefit();

    const response = aListResponse()
      .withBenefitsWithPlanInfo([combineBenefitWithPlanInfo(benefit, plan)])
      .build();
    ambassadorServer
      .createStub(PricingPlanBenefitsServer)
      .BenefitManagement()
      .list.when(() => true)
      .resolve(response);
    const res = await axiosInstance.get(app.getUrl('/bookings/v1/pricingPlan'));
    expect(res).toBeDefined();
  });

  it('should get a benefit with pricing plan info', async () => {
    const plan = anyPlanInfo();
    const benefit = limitedBenefit();

    const response = aListResponse()
      .withBenefitsWithPlanInfo([combineBenefitWithPlanInfo(benefit, plan)])
      .build();
    ambassadorServer
      .createStub(PricingPlanBenefitsServer)
      .BenefitManagement()
      .list.when(() => true)
      .resolve(response);
    const res = await axiosInstance.get(
      app.getUrl(`/bookings/v1/pricingPlan/${plan.id}`),
    );
    const pricingPlanInfo = res.data;
    expect(pricingPlanInfo.benefits.length).toBe(1);
    expect(pricingPlanInfo.planId).toBe(plan.id);
  });

  it('should update benefit', async () => {
    ambassadorServer
      .createStub(PricingPlanBenefitsServer)
      .BenefitManagement()
      .update.when(() => true)
      .resolve({});
    const request: UpdateBenefitsDTO = anyUpdateBenefitDTO();
    const res = await axiosInstance.put(
      app.getUrl(`/bookings/v1/pricingPlan/${request.planId}`),
      request,
    );
    expect(res.status).toBe(200);
    expect(res.data).toBeDefined();
  });

  it('should get pricing plans for contact', async () => {
    const contactId = chance.guid();
    const offeringId = chance.guid();
    const orderId = chance.guid();
    const slotStartTime = new Date().getTime();
    const planName = chance.name();

    ambassadorServer
      .createStub(CheckoutServer)
      .CheckoutBackend()
      .checkoutOptions.when(() => true)
      .resolve(
        aCheckoutOptionsResponse()
          .withCheckoutOptions(
            aCheckoutOptions()
              .withPaidPlans(
                aPaidPlans()
                  .withDefaultPlan(
                    aPlan()
                      .withPlanName(planName)
                      .withPaidPlan(
                        aPaidPlan()
                          .withOrderId(orderId)
                          .build(),
                      )
                      .build(),
                  )
                  .build(),
              )
              .build(),
          )
          .build(),
      );

    const theService = aService()
      .withId(offeringId)
      .withScheduleIds([chance.guid()])
      .build();

    ambassadorServer
      .createStub(ServicesCatalogServer)
      .ServicesCatalog()
      .get.when(() => true)
      .resolve(
        aGetServiceResponse()
          .withSchedules([aSchedule().build()])
          .withService(theService)
          .build(),
      );
    const res = await axiosInstance.get(
      app.getUrl(
        `/bookings/v1/customer/${contactId}/planForSlot/${offeringId}/${slotStartTime}`,
      ),
    );
    expect(res.status).toBe(200);
    expect(res.data).toBeDefined();
  });
});
