import { Chance } from 'chance';
import { PricingPlanDto } from '../../../src/dto/pricing-plans/pricing-plan.dto';

const chance = Chance();
function validPricingPlan(): PricingPlanDto {
  return {
    id: chance.guid(),
    name: 'plan silver',
    status: 'active',
  };
}

export class PricingPlanDtoBuilder {
  pricingPlan: PricingPlanDto = { ...validPricingPlan() };

  withId(cid) {
    this.pricingPlan.id = cid;
    return this;
  }

  withName(name) {
    this.pricingPlan.name = name;
    return this;
  }

  build() {
    return this.pricingPlan;
  }
}
