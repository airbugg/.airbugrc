import { StaffDto } from '../../../src/dto/staff.dto';
import { Chance } from 'chance';
import { Resource } from '@wix/ambassador-resources-server';
import { WorkingHoursDto } from '../../../src/dto/working-hours.dto';

const chance = Chance();
export function validStaff(workingHoursDto: WorkingHoursDto = null): StaffDto {
  return {
    fullName: `${chance.first()} ${chance.last()}`,
    phone: chance.phone(),
    email: chance.email(),
    workingHours: workingHoursDto,
  };
}
export function buildASimpleStaffFromResource(
  resource: Resource,
  hours: WorkingHoursDto,
) {
  return {
    fullName: resource.name,
    phone: resource.phone,
    email: resource.email,
    workingHours: hours,
  };
}
