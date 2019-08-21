import { mapResourcesToStaff } from './resorces-to-staff-mapper';
import {
  DEFAULT_STAFF_TAG,
  STAFF_TAG,
} from '../../resources/resources-adapter-rpc';
import { aSyncStatus } from '@wix/ambassador-external-calendar-server/builders';
import { aResource } from '@wix/ambassador-resources-server/builders';
import {
  Calendar,
  CalendarStatus,
} from '@wix/ambassador-external-calendar-server/types';
import { ResourceStatus } from '@wix/ambassador-resources-server/types';

const someSyncStatus = aSyncStatus().build();

function testResource() {
  return aResource()
    .withName('staff name')
    .withId('id')
    .withEmail('email@mail.com')
    .withPhone('1800-800-800')
    .withSchedules(null)
    .withTags([STAFF_TAG])
    .build();
}

describe('Resources to StaffDto', () => {
  it('map Resources to staff ', () => {
    const resource = testResource();
    const staff = mapResourcesToStaff(resource, someSyncStatus);
    expect(staff.fullName).toBe(resource.name);
    expect(staff.id).toBe(resource.id);
    expect(staff.phone).toBe(resource.phone);
    expect(staff.email).toBe(resource.email);
  });

  it('maps google external calendar is pending', () => {
    const syncStatus = aSyncStatus()
      .withCalendar(Calendar.GOOGLE)
      .withStatus(CalendarStatus.PENDING)
      .build();

    const staff = mapResourcesToStaff(testResource(), syncStatus);

    expect(staff.connectedCalendars.google).toBe(false);
    expect(staff.connectedCalendars.googleStatus).toBe('PENDING');
  });

  it('maps google external calendar is connected', () => {
    const syncStatus = aSyncStatus()
      .withCalendar(Calendar.GOOGLE)
      .withStatus(CalendarStatus.CONNECTED)
      .build();

    const staff = mapResourcesToStaff(testResource(), syncStatus);

    expect(staff.connectedCalendars.google).toBe(true);
    expect(staff.connectedCalendars.googleStatus).toBe('CONNECTED');
  });

  it('no external calendar', () => {
    const staff = mapResourcesToStaff(testResource(), null);

    expect(staff.connectedCalendars.google).toBe(false);
    expect(staff.connectedCalendars.googleStatus).toBe('NONE');
  });

  it('should return pristine Owner default_staff and status created', () => {
    const syncStatus = aSyncStatus()
      .withCalendar(Calendar.GOOGLE)
      .withStatus(CalendarStatus.DISCONNECTED)
      .build();
    const resource = testResource();
    resource.status = ResourceStatus.CREATED;
    resource.tags.push(DEFAULT_STAFF_TAG);
    const staff = mapResourcesToStaff(resource, syncStatus);
    expect(staff.pristineOwner).toBe(true);
  });

  it('should return pristineOwner false: default_staff but all ready been edited', () => {
    const resource = testResource();
    resource.status = ResourceStatus.UPDATED;
    resource.tags.push(DEFAULT_STAFF_TAG);
    const staff = mapResourcesToStaff(resource, someSyncStatus);
    expect(staff.pristineOwner).toBe(false);
  });

  it('maps google external calendar is disconnected', () => {
    const syncStatus = aSyncStatus()
      .withCalendar(Calendar.GOOGLE)
      .withStatus(CalendarStatus.DISCONNECTED)
      .build();

    const staff = mapResourcesToStaff(testResource(), syncStatus);

    expect(staff.connectedCalendars.google).toBe(false);
    expect(staff.connectedCalendars.googleStatus).toBe('NONE');
  });
});
