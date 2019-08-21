import { mapStaffToResource } from './staff-to-resorces-mapper';
import { StaffDto } from '../../../dto/staff.dto';
import { validStaff } from '../../../../test/builders/dto/staff.dto';

describe('StaffDto StaffDto Resources', () => {
  const timezone = 'Etc/UTC';
  it('map simple staff to Resources', () => {
    const staff = validStaff();
    const aResource = mapStaffToResource(staff, timezone);
    expect(aResource.name).toBe(staff.fullName);
    expect(aResource.phone).toBe(staff.phone);
    expect(aResource.email).toBe(staff.email);
  });

  it('map staff with image to Resources', () => {
    const staff = validStaff();
    staff.image = {
      width: 100,
      height: 200,
      relativeUri: 'http://image.png',
      filename: 'jon-dor.png',
    };
    const aResource = mapStaffToResource(staff, timezone);
    expect(aResource.images[0].url).toBe(staff.image.relativeUri);
  });
});
