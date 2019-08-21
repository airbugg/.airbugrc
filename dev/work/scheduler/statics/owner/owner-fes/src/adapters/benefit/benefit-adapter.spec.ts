import {
  getBenefit,
  getEligibleServicesForPlan,
  getPlansList,
  updateBenefit,
} from './benefit-adapter';
import { aServiceResponseWithPlan } from '../../../test/builders/rpc-custom/service';
import { Benefit } from '@wix/ambassador-pricing-plan-benefits-server';
import {
  anyPlanInfo,
  combineBenefitWithPlanInfo,
  limitedBenefit,
} from '../../../test/builders/rpc-custom/benefit-with-plan';
import { anyUpdateBenefitDTO } from '../../../test/builders/dto/update-benefit.dto.builder';
import { aListResponse } from '@wix/ambassador-pricing-plan-benefits-server/builders';
import { aListServicesResponse } from '@wix/ambassador-services-catalog-server/builders';

describe('benefit', () => {
  describe('eligible services', () => {
    it('should return an empty list of eligible services', async () => {
      const res = await getEligibleServicesForPlan(async () => null);
      expect(res.length).toBe(0);
    });

    it('should return a singlez eligible service', async () => {
      const serviceResponse = aListServicesResponse()
        .withServices([aServiceResponseWithPlan().build()])
        .build();
      const res = await getEligibleServicesForPlan(async () => serviceResponse);
      expect(res.length).toBe(1);
    });

    it('should return a list of eligible services', async () => {
      const serviceResponse = aListServicesResponse()
        .withServices([
          aServiceResponseWithPlan().build(),
          aServiceResponseWithPlan().build(),
        ])
        .build();
      const res = await getEligibleServicesForPlan(async () => serviceResponse);
      expect(res.length).toBe(2);
    });
  });
  describe('get booking benefit', () => {
    it('should return empty bookings benefit', async () => {
      const plan = anyPlanInfo();
      const listBenefit = aListResponse()
        .withBenefitsWithPlanInfo([combineBenefitWithPlanInfo(null, plan)])
        .build();
      const noPlanRes = await getBenefit(plan.id, async () => listBenefit);
      expect(noPlanRes.planId).toBe(plan.id);
      expect(noPlanRes.purchased).toBe(plan.hasOrders);
      expect(noPlanRes.benefits).toBe(null);
    });

    it('should return bookings benefit with benefit', async () => {
      const benefit = limitedBenefit();
      const plan = anyPlanInfo();
      const listBenefit = aListResponse()
        .withBenefitsWithPlanInfo([combineBenefitWithPlanInfo(benefit, plan)])
        .build();

      const planRes = await getBenefit(
        plan.id,
        async (planIds: string[]) => listBenefit,
      );
      expect(planRes.planId).toBe(plan.id);
      expect(planRes.purchased).toBe(plan.hasOrders);
      expect(planRes.benefits.length).toBe(1);
    });

    it('should update benefit under a plan', async () => {
      const updateBenefitDTO = anyUpdateBenefitDTO();
      let benefitToUpdate: Benefit;
      let planIdToUpdate: string;
      const updater: jest.Mock = jest.fn();
      await updateBenefit(updateBenefitDTO, updater, () => null);
      benefitToUpdate = updater.mock.calls[0][1];
      planIdToUpdate = updater.mock.calls[0][0];
      expect(planIdToUpdate).toBe(updateBenefitDTO.planId);
      expect(benefitToUpdate.id).toBe(updateBenefitDTO.benefits[0].id);
      expect(benefitToUpdate.benefitType).toBe(
        updateBenefitDTO.benefits[0].type,
      );
      expect(benefitToUpdate.creditAmount).toBe(
        updateBenefitDTO.benefits[0].numOfSessions,
      );
      expect(benefitToUpdate.resourceIds).toEqual(
        updateBenefitDTO.benefits[0].includedServices,
      );
    });

    it('should create benefit under a plan', async () => {
      const updateBenefitDTO = anyUpdateBenefitDTO();
      delete updateBenefitDTO.benefits[0].id;
      let benefitToCreate: Benefit;
      let planIdToUpdate: string;
      const creator: jest.Mock = jest.fn().mockResolvedValue({});
      await updateBenefit(updateBenefitDTO, () => null, creator);
      planIdToUpdate = creator.mock.calls[0][0];
      benefitToCreate = creator.mock.calls[0][1];
      expect(planIdToUpdate).toBe(updateBenefitDTO.planId);
      expect(benefitToCreate.id).toBe(null);
      expect(benefitToCreate.benefitType).toBe(
        updateBenefitDTO.benefits[0].type,
      );
      expect(benefitToCreate.creditAmount).toBe(
        updateBenefitDTO.benefits[0].numOfSessions,
      );
      expect(benefitToCreate.resourceIds).toEqual(
        updateBenefitDTO.benefits[0].includedServices,
      );
    });
    it('get a list of plans', async () => {
      const plan = anyPlanInfo();
      const benefit = limitedBenefit();
      const listResponse = aListResponse()
        .withBenefitsWithPlanInfo([combineBenefitWithPlanInfo(benefit, plan)])
        .build();
      const getterOfPlans = jest.fn().mockResolvedValue(listResponse);
      const planList = await getPlansList(getterOfPlans);
      expect(planList.length).toBe(1);
    });
  });
});
