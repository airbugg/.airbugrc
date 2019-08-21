import { Resource } from '@wix/ambassador-resources-server/rpc';
import { mapWebImageToPlatformImage } from '../image/web-image-to-platfrom-image-mapper';
import { mapWorkingHoursToSchedule } from '../working-hours/working-hours-to-schedule-mapper';
import { StaffDto } from '../../../dto/staff.dto';
import { STAFF_TAG } from '../../resources/resources-adapter-rpc';

export function mapStaffToResource(
  staff: StaffDto,
  timezone: string,
): Resource {
  let schedules;
  if (!staff.workingHours) {
    schedules = [{}];
  } else {
    schedules = [mapWorkingHoursToSchedule(staff.workingHours, timezone)];
  }
  const resource: Resource = {
    email: staff.email,
    name: staff.fullName,
    phone: staff.phone,
    images: mapImages(staff.image),
    tags: null,
    schedules,
    status: null,
    id: staff.id ? staff.id : null,
  };
  return resource;
}

function mapImages(image) {
  if (image) {
    return [mapWebImageToPlatformImage(image)];
  }
  return null;
}

export function addTagForCreatedStaff(resource: Resource): Resource {
  resource.tags = [STAFF_TAG];
  return resource;
}
