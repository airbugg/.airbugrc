import { Chance } from 'chance';
import { UpdateBenefitsDTO } from '../../../src/dto/pricing-plans/pricing-plan.dto';

const chance = new Chance();

export function anyUpdateBenefitDTO(): UpdateBenefitsDTO {
  const numOfService = chance.natural({ min: 0, max: 5 });
  const services = [];
  for (let i = 0; i < numOfService; i++) {
    services.push(chance.guid());
  }
  return {
    planId: chance.guid(),
    benefits: [
      {
        id: chance.guid(),
        type: chance.pickone(['UNLIMITED', 'LIMITED', 'UNDEFINED']),
        includedServices: services,
        numOfSessions: chance.natural({ min: 1, max: 50 }),
      },
    ],
  };
}
