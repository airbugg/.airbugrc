import { Resource } from '@wix/ambassador-resources-server';
import { Schedule } from '@wix/ambassador-services-server';
import { aResource } from '@wix/ambassador-services-catalog-server/builders';
import { aNineToFive7DaysAWeekSchedule } from './schedule-builder';
import { Chance } from 'chance';

const chance = new Chance();
export function aStaffResource(schedule: Schedule): Resource {
  return aResource()
    .withId(chance.guid())
    .withSchedules([schedule])
    .withTag('staff')
    .build();
}

export function aBusinessResource(): Resource {
  const schedule = aNineToFive7DaysAWeekSchedule();
  return aResource()
    .withSchedules([schedule])
    .withTag('business')
    .withId(chance.guid())
    .withName('business')
    .build();
}
