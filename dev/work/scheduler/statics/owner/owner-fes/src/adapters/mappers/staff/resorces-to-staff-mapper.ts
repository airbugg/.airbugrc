import { Resource } from '@wix/ambassador-resources-server/rpc';
import { mapScheduleToWorkingHours } from '../working-hours/schedule-to-working-hours-mapper';
import { mapWebImage } from '../image/platfrom-image-to-web-image-mapper';
import { SyncStatus } from '@wix/ambassador-external-calendar-server';
import { DEFAULT_STAFF_TAG } from '../../resources/resources-adapter-rpc';

export function mapResourcesToStaff(
  resource: Resource,
  syncStatus: SyncStatus,
) {
  return {
    id: resource.id,
    fullName: resource.name,
    phone: resource.phone,
    email: resource.email,
    image: getImage(resource.images),
    connectedCalendars: getExternalCalendarStatus(syncStatus),
    pristineOwner: getPristineOwner(resource),
    workingHours: resource.schedules
      ? mapScheduleToWorkingHours(resource.schedules[0])
      : null,
  };
}

function getPristineOwner(resource: Resource) {
  return (
    resource.tags.includes(DEFAULT_STAFF_TAG) && resource.status === 'CREATED'
  );
}

function getImage(images) {
  return images ? mapWebImage(images[0]) : null;
}

function getExternalCalendarStatus(syncStatus: SyncStatus) {
  // we don't get the calendar type from the rpc b/c it's the default value
  // if (syncStatus && syncStatus.calendar === 'GOOGLE') {
  if (syncStatus) {
    syncStatus.status = !['CONNECTED', 'PENDING'].includes(syncStatus.status)
      ? 'NONE'
      : syncStatus.status;

    return {
      google: syncStatus.status === 'CONNECTED',
      googleStatus: syncStatus.status,
    };
  }
  return { google: false, googleStatus: 'NONE' };
}
