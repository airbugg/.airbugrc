import {
  aBenefit,
  aBenefitWithPlanInfo,
  aPlanInfo,
} from '@wix/ambassador-pricing-plan-benefits-server/builders';
import { Chance } from 'chance';
import { BenefitType } from '@wix/ambassador-pricing-plan-benefits-server/types';

const chance = new Chance();

export function limitedBenefit() {
  return aBenefit()
    .withId(chance.guid())
    .withBenefitType(BenefitType.LIMITED)
    .withCreditAmount(chance.natural())
    .withResourceIds([chance.guid(), chance.guid()])
    .build();
}

export function limitedBenefitWithoutServices() {
  return aBenefit()
    .withId(chance.guid())
    .withBenefitType(BenefitType.LIMITED)
    .withCreditAmount(chance.natural())
    .withResourceIds(undefined)
    .build();
}

export function anyPlanInfo() {
  return aPlanInfo()
    .withHasOrders(chance.bool())
    .withName(chance.name())
    .withId(chance.guid())
    .build();
}

export function combineBenefitWithPlanInfo(benefit, planInfo) {
  return aBenefitWithPlanInfo()
    .withBenefit(benefit)
    .withPlanInfo(planInfo)
    .build();
}
