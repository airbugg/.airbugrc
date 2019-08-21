import {
  createResourceFromStaff,
  editStaffAsResource,
  getAllowActions,
  updateBusinessResource,
} from './resources-adapter';
import { Chance } from 'chance';
import {
  aGetServiceResponse,
  aListServicesResponse,
} from '@wix/ambassador-services-catalog-server/builders';
import {
  RecurringInterval,
  Resource,
} from '@wix/ambassador-services-catalog-server/rpc';
import { validStaff } from '../../../test/builders/dto/staff.dto';
import { buildAWorkingHours } from '../../../test/builders/dto/working-hours.dto.builder';
import { Interval } from '@wix/ambassador-resources-server/rpc';
import { StaffDriver } from '@wix/bookings-platform-adapter/lib/adapters/staff/staff.driver';
import {
  aCreateResourceRequest,
  aListResourcesResponse,
  anAvailability,
  anUpdateResourceResponse,
  aResource,
} from '@wix/ambassador-resources-server/builders';
import {
  aBusinessResource,
  aStaffResource,
} from '../../../test/builders/rpc-custom/resource-builder';
import { aScheduleWithLinkSchedule } from '../../../test/builders/rpc-custom/schedule-builder';
import { Schedule } from '@wix/ambassador-services-server';
import { createBusinessInfo } from '../../../test/builders/dto/business-info.dto.builder';
import { DEFAULT_STAFF_TAG, STAFF_TAG } from './resources-adapter-rpc';
import { aGetInfoViewResponse } from '@wix/ambassador-business-server/builders';
import { aSchedule, aService } from '@wix/ambassador-services-server/builders';
const chance = new Chance();

describe('staff', () => {
  function createResourcesResponse(resources: Resource[]) {
    return aListResourcesResponse()
      .withResources(resources)
      .build();
  }
  const experiments = { 'specs.wos.BookingsFitness': 'true' };

  describe('allow actions', () => {
    it('marks the staff as assigned to role', async () => {
      const hasRole = true;
      const staffId = chance.guid();
      const resourcesList = createResourcesResponse([aResource().build()]);
      const serviceList = aListServicesResponse()
        .withServices([])
        .build();
      const allowActions = await getAllowActions(
        staffId,
        async (id: string) => serviceList,
        async () => resourcesList,
        experiments,
        async () => hasRole,
      );
      expect(allowActions.hasRole).toBe(hasRole);
    });

    it('marks the staff as NOT assigned to role', async () => {
      const hasRole = false;
      const staffId = chance.guid();
      const resourcesList = createResourcesResponse([aResource().build()]);
      const serviceList = aListServicesResponse()
        .withServices([])
        .build();
      const allowActions = await getAllowActions(
        staffId,
        async (id: string) => serviceList,
        async () => resourcesList,
        experiments,
        async () => hasRole,
      );
      expect(allowActions.hasRole).toBe(hasRole);
    });

    it('marks staff member as assigned to service', async () => {
      const staffId = chance.guid();
      const resourcesList = createResourcesResponse([
        aResource().build(),
        aResource()
          .withSchedules([])
          .build(),
      ]);
      const serviceList = aListServicesResponse()
        .withServices([
          aGetServiceResponse()
            .withService(aService().build())
            .build(),
        ])
        .build();

      const allowActions = await getAllowActions(
        staffId,
        async (id: string) => serviceList,
        async () => resourcesList,
        experiments,
        async () => false,
      );

      expect(allowActions.hasAssignedOfferings).toBe(true);
    });

    it('marks staff as not deletable if staff is assigned to a role', async () => {
      const hasRole = false;
      const staffId = chance.guid();
      const resourcesList = createResourcesResponse([aResource().build()]);
      const serviceList = aListServicesResponse()
        .withServices([])
        .build();
      const allowActions = await getAllowActions(
        staffId,
        async (id: string) => serviceList,
        async () => resourcesList,
        experiments,
        async () => hasRole,
      );
      expect(allowActions.hasRole).toBe(hasRole);
    });
  });

  describe('when determening whether a service can be deleted', () => {
    it('marks staff as not deletable if staff is assigned to a role', async () => {
      const staffId = chance.guid();
      const resourcesList = createResourcesResponse([aResource().build()]);
      const serviceList = aListServicesResponse()
        .withServices([])
        .build();
      const allowActions = await getAllowActions(
        staffId,
        async (id: string) => serviceList,
        async () => resourcesList,
        experiments,
        async () => true,
      );
      expect(allowActions.deletable).toBe(false);
    });

    it('should return deletable false staff offer a service', async () => {
      const staffId = chance.guid();
      const resourcesList = createResourcesResponse([
        aResource().build(),
        aResource()
          .withSchedules([])
          .build(),
      ]);
      const serviceList = aListServicesResponse()
        .withServices([
          aGetServiceResponse()
            .withService(aService().build())
            .build(),
        ])
        .build();
      const allowActions = await getAllowActions(
        staffId,
        async (id: string) => serviceList,
        async () => resourcesList,
        experiments,
        async () => false,
      );
      expect(allowActions.deletable).toBe(false);
    });

    it('should return deletable false last staff', async () => {
      const staffId = chance.guid();
      const resource = aResource().build();
      const resourcesList = createResourcesResponse([aResource().build()]);
      const serviceList = aListServicesResponse()
        .withServices([])
        .build();
      const allowActions = await getAllowActions(
        resource.id,
        async (id: string) => serviceList,
        async () => resourcesList,
        experiments,
        async () => false,
      );
      expect(allowActions.deletable).toBe(false);
    });

    it('should return deletable true not last staff and not offered services and has no assigned roles', async () => {
      const staffId = chance.guid();
      const resource = aResource().build();
      const resourcesList = createResourcesResponse([
        aResource().build(),
        aResource().build(),
      ]);
      const serviceList = aListServicesResponse()
        .withServices([])
        .build();
      const allowActions = await getAllowActions(
        resource.id,
        async (id: string) => serviceList,
        async () => resourcesList,
        experiments,
        async () => false,
      );
      expect(allowActions.deletable).toBe(true);
    });
  });

  describe('When Fitness Experiment is off', () => {
    beforeEach(() => (experiments['specs.wos.BookingsFitness'] = 'false'));
    it('should return deletable false staff offer a service', async () => {
      const staffId = chance.guid();
      const resourcesList = createResourcesResponse([
        aResource().build(),
        aResource()
          .withSchedules([])
          .build(),
      ]);
      const serviceList = aListServicesResponse()
        .withServices([
          aGetServiceResponse()
            .withService(aService().build())
            .build(),
        ])
        .build();
      const allowActions = await getAllowActions(
        staffId,
        async (id: string) => serviceList,
        async () => resourcesList,
        experiments,
        async () => null,
      );
      expect(allowActions.deletable).toBe(false);
    });

    it('should return deletable false last staff', async () => {
      const staffId = chance.guid();
      const resource = aResource().build();
      const resourcesList = createResourcesResponse([aResource().build()]);
      const serviceList = aListServicesResponse()
        .withServices([])
        .build();
      const allowActions = await getAllowActions(
        resource.id,
        async (id: string) => serviceList,
        async () => resourcesList,
        experiments,
        async () => null,
      );
      expect(allowActions.deletable).toBe(false);
    });
    it('should return deletable true not last staff and not offered services', async () => {
      const staffId = chance.guid();
      const resource = aResource().build();
      const resourcesList = createResourcesResponse([
        aResource().build(),
        aResource().build(),
      ]);
      const serviceList = aListServicesResponse()
        .withServices([])
        .build();
      const allowActions = await getAllowActions(
        resource.id,
        async (id: string) => serviceList,
        async () => resourcesList,
        experiments,
        async () => null,
      );
      expect(allowActions.deletable).toBe(true);
    });
  });
});

describe('edit staff', () => {
  function setUpUpdateResource(workingsHours: any) {
    const staff = validStaff(workingsHours);
    staff.id = chance.guid();
    const businessResource = aBusinessResource();
    const staffResource = aStaffResource(
      aScheduleWithLinkSchedule(
        aSchedule()
          .withId(chance.guid())
          .withAvailability(
            anAvailability()
              .withStart(new Date().toISOString())
              .build(),
          )
          .withTags([STAFF_TAG, DEFAULT_STAFF_TAG])
          .build(),
      ),
    );
    staffResource.id = staff.id;
    return {
      staff,
      businessResource,
      staffResource,
    };
  }

  it('should copy existing tags', async () => {
    const testSetup = setUpUpdateResource(buildAWorkingHours());
    let resourceToUpdate;
    const updaterOfResource = async (resource: Resource) => {
      resourceToUpdate = resource;
      return {};
    };
    await editStaffAsResource(
      testSetup.staff,
      async () =>
        aGetInfoViewResponse()
          .withTimeZone('Etc/UTC')
          .build(),
      async () => testSetup.businessResource,
      async () =>
        aListResourcesResponse()
          .withResources([testSetup.staffResource])
          .build(),
      updaterOfResource,
    );
    expect(resourceToUpdate.tags).toEqual(testSetup.staffResource.tags);
  });

  it('should copy availability start time tags', async () => {
    const testSetup = setUpUpdateResource(buildAWorkingHours());
    let resourceToUpdate: Resource;
    const updaterOfResource = async (resource: Resource) => {
      resourceToUpdate = resource;
      return {};
    };
    await editStaffAsResource(
      testSetup.staff,
      async () =>
        aGetInfoViewResponse()
          .withTimeZone('Etc/UTC')
          .build(),
      async () => testSetup.businessResource,
      async () =>
        aListResourcesResponse()
          .withResources([testSetup.staffResource])
          .build(),
      updaterOfResource,
    );
    expect(resourceToUpdate.schedules[0].availability.start).toEqual(
      testSetup.staffResource.schedules[0].availability.start,
    );
  });

  describe('edit staff with custom workings hours', () => {
    it('edit staff with linked schedule', async () => {
      const testSetup = setUpUpdateResource(null);
      let resourceToUpdate;
      const updaterOfResource = async (resource: Resource) => {
        resourceToUpdate = resource;
        return {};
      };
      await editStaffAsResource(
        testSetup.staff,
        async () =>
          aGetInfoViewResponse()
            .withTimeZone('Etc/UTC')
            .build(),
        async () => testSetup.businessResource,
        async () =>
          aListResourcesResponse()
            .withResources([testSetup.staffResource])
            .build(),
        updaterOfResource,
      );

      const schedulerToUpdate: Schedule = resourceToUpdate.schedules[0];
      expect(resourceToUpdate.name).toBe(testSetup.staff.fullName);
      expect(resourceToUpdate.schedules[0].id).toBe(
        testSetup.staffResource.schedules[0].id,
      );

      expect(schedulerToUpdate.availability.linkedSchedules[0].scheduleId).toBe(
        testSetup.businessResource.schedules[0].id,
      );
      expect(
        schedulerToUpdate.availability.linkedSchedules[0].scheduleOwnerId,
      ).toBe(testSetup.businessResource.id);
      expect(
        schedulerToUpdate.availability.linkedSchedules[0].transparency,
      ).toBe('FREE');
    });

    it('edit staff with working hours', async () => {
      const testSetup = setUpUpdateResource(buildAWorkingHours());
      let resourceToUpdate;
      const updaterOfResource = async (resource: Resource) => {
        resourceToUpdate = resource;
        return {};
      };
      await editStaffAsResource(
        testSetup.staff,
        async () =>
          aGetInfoViewResponse()
            .withTimeZone('Etc/UTC')
            .build(),
        async () => testSetup.businessResource,
        async (resourcesIds: string[]) =>
          aListResourcesResponse()
            .withResources([testSetup.staffResource])
            .build(),
        updaterOfResource,
      );
      const schedulesToUpdate = resourceToUpdate.schedules[0];

      expect(resourceToUpdate.name).toBe(testSetup.staff.fullName);
      expect(resourceToUpdate.id).toBe(testSetup.staff.id);
      expect(schedulesToUpdate.id).toBe(
        testSetup.staffResource.schedules[0].id,
      );

      let day = 'mon';
      expect(findIntervalBy(schedulesToUpdate.intervals, day).daysOfWeek).toBe(
        day.toUpperCase(),
      );
      expect(
        findIntervalBy(schedulesToUpdate.intervals, day),
      ).toBeDerivativeFromWorkingsHours(testSetup.staff.workingHours[day][0]);

      day = 'tue';
      expect(findIntervalBy(schedulesToUpdate.intervals, day).daysOfWeek).toBe(
        day.toUpperCase(),
      );
      expect(
        findIntervalBy(schedulesToUpdate.intervals, day),
      ).toBeDerivativeFromWorkingsHours(testSetup.staff.workingHours[day][0]);
    });
  });
});

describe('create staff', () => {
  it('should create a staff with link schedule', async () => {
    let resourceForCreate: Resource;
    const staff = validStaff();
    const businessResource = aBusinessResource();
    const creatorOfResource = async (resource: Resource) => {
      resourceForCreate = resource;
      return aCreateResourceRequest()
        .withResource(resource)
        .build();
    };
    const res = await createResourceFromStaff(
      staff,
      async () =>
        aGetInfoViewResponse()
          .withTimeZone('Etc/UTC')
          .build(),
      creatorOfResource,
      async () => businessResource,
    );
    expect(resourceForCreate.name).toBe(staff.fullName);
    expect(resourceForCreate.email).toBe(staff.email);
    expect(resourceForCreate.tags).toEqual(['staff']);
    expect(resourceForCreate.phone).toBe(staff.phone);
    const linkedSchedules =
      resourceForCreate.schedules[0].availability.linkedSchedules[0];
    expect(linkedSchedules.transparency).toBe('FREE');
    expect(linkedSchedules.scheduleId).toBe(businessResource.schedules[0].id);
    expect(linkedSchedules.scheduleOwnerId).toBe(businessResource.id);
  });
});

describe('business resource', () => {
  // flaky ?
  it('should update the working hours of the business', async () => {
    const businessInfo = createBusinessInfo(buildAWorkingHours());
    const businessResource = aBusinessResource();
    let resourceForUpdate: Resource;
    const updaterMock = async (resource: Resource) => {
      resourceForUpdate = resource;
      return anUpdateResourceResponse().build();
    };
    const res = await updateBusinessResource(
      businessInfo,
      async () => businessResource,
      updaterMock,
    );
    const scheduleForUpdate = resourceForUpdate.schedules[0];
    expect(resourceForUpdate.id).toBe(businessResource.id);
    expect(scheduleForUpdate.id).toBe(businessResource.schedules[0].id);
    let day = 'mon';
    expect(findIntervalBy(scheduleForUpdate.intervals, day).daysOfWeek).toBe(
      day.toUpperCase(),
    );
    expect(
      findIntervalBy(scheduleForUpdate.intervals, day),
    ).toBeDerivativeFromWorkingsHours(businessInfo.workingHours[day][0]);
    day = 'tue';
    expect(findIntervalBy(scheduleForUpdate.intervals, day).daysOfWeek).toBe(
      day.toUpperCase(),
    );
    expect(
      findIntervalBy(scheduleForUpdate.intervals, day),
    ).toBeDerivativeFromWorkingsHours(businessInfo.workingHours[day][0]);
  });
});

function findIntervalBy(intervals: RecurringInterval[], day: string): Interval {
  return intervals.find(
    (recurringInterval: RecurringInterval) =>
      recurringInterval.interval.daysOfWeek === day.toUpperCase(),
  ).interval;
}
