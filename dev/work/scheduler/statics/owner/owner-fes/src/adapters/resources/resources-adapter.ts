import {
  LinkedSchedule,
  Resource,
  Schedule,
  ListResourcesResponse,
  UpdateResourceResponse,
} from '@wix/ambassador-resources-server';
import {
  getAllStaffAsResourceFactory,
  getterOfStaffByIdFactory,
} from './resources-adapter-rpc';
import {
  addTagForCreatedStaff,
  mapStaffToResource,
} from '../mappers/staff/staff-to-resorces-mapper';
import { StaffDto } from '../../dto/staff.dto';
import { ListServicesResponse } from '@wix/ambassador-services-catalog-server/rpc';
import { Business } from '../../dto/business-info/business-info.dto';
import {
  mapWorkingHoursToSchedule,
  startOfDayISOString,
} from '../mappers/working-hours/working-hours-to-schedule-mapper';
import { GetInfoViewResponse } from '@wix/ambassador-business-server';
import { staffHasRole } from '../staff';

function linkStaffScheduleToBusinessSchedule(
  staffResource: Resource,
  businessResource: Resource,
  timezone: string,
) {
  staffResource.schedules = [
    {
      intervals: null,
      tags: null,
      participants: null,
      id: null,
      totalNumberOfParticipants: null,
      availability: {
        start: startOfDayISOString(timezone),
        linkedSchedules: [
          scheduleToLinkedSchedule(
            businessResource.schedules[0],
            businessResource,
          ),
        ],
      },
      status: null,
    },
  ];
}

function scheduleToLinkedSchedule(
  schedule: Schedule,
  businessResource: Resource,
): LinkedSchedule {
  return {
    scheduleId: schedule.id,
    scheduleOwnerId: businessResource.id,
    transparency: 'FREE',
  };
}

export async function createResourceFromStaff(
  staff: StaffDto,
  getterOfBusinessInfoView: () => Promise<GetInfoViewResponse>,
  createResource: (resource: Resource) => Promise<any>,
  getterBusinessResource: () => Promise<Resource>,
) {
  const businessInfoView = await getterOfBusinessInfoView();
  let staffResource: Resource = mapStaffToResource(
    staff,
    businessInfoView.timeZone,
  );
  staffResource = addTagForCreatedStaff(staffResource);
  await linkScheduleWhenNeeded(
    getterBusinessResource,
    staffResource,
    businessInfoView.timeZone,
  );
  const resourceResponse = await createResource(staffResource);
  return resourceResponse.resource.id;
}

export async function linkScheduleWhenNeeded(
  getterBusinessResource,
  staffResource: Resource,
  timezone: string,
) {
  if (!staffResource.schedules[0].intervals) {
    const businessResources = await getterBusinessResource();
    linkStaffScheduleToBusinessSchedule(
      staffResource,
      businessResources,
      timezone,
    );
    return true;
  }
  return false;
}

export const getStaffById = async (aspects, staffId): Promise<Resource> => {
  const getterOfAllStaffAsResource = getterOfStaffByIdFactory(aspects);
  const listResourcesResponse: ListResourcesResponse = await getterOfAllStaffAsResource(
    [staffId],
  );
  const staff = listResourcesResponse.resources;
  return staff[0];
};

export const staffIdByScheduleId = async aspects => {
  const getterOfAllStaffAsResource = getAllStaffAsResourceFactory(aspects);
  const listResourcesResponse: ListResourcesResponse = await getterOfAllStaffAsResource();
  const scheduleIdToStaffId = !listResourcesResponse.resources
    ? []
    : listResourcesResponse.resources.reduce((result, staff) => {
        if (!staff.schedules || !staff.schedules[0]) {
          return result;
        }

        result[staff.schedules[0].id] = staff.id;
        return result;
      }, {});
  return scheduleIdToStaffId;
};

function hasMoreThenOneStaff(resourcesList: ListResourcesResponse) {
  return resourcesList.resources && resourcesList.resources.length > 1;
}

function hasAssignedServices(servicesList: ListServicesResponse) {
  return servicesList.services && servicesList.services.length > 0;
}

interface AllowedActions {
  deletable: boolean;
  hasRole?: boolean;
  hasAssignedOfferings?: boolean;
}

export async function getAllowActions(
  staffId,
  getterOfServicesForStaff: (staffId: string) => Promise<ListServicesResponse>,
  getterOfStaffList: () => Promise<ListResourcesResponse>,
  experiments: { [key: string]: string },
  hasRoleResolver: (staffId) => Promise<boolean>,
): Promise<AllowedActions> {
  //todo - for sched-9380 - need to get the future bookings of the staff member
  if (experiments['specs.wos.BookingsFitness'] === 'true') {
    const [servicesList, resourcesList, hasRole] = await Promise.all([
      getterOfServicesForStaff(staffId),
      getterOfStaffList(),
      hasRoleResolver(staffId),
    ]);

    const hasAssignedOfferings = hasAssignedServices(servicesList);

    const couldBeDeleted =
      hasMoreThenOneStaff(resourcesList) &&
      !hasAssignedServices(servicesList) &&
      !hasRole;

    const actions = {
      deletable: couldBeDeleted,
      hasRole,
      hasAssignedOfferings,
    };

    return actions;
  }
  {
    const [servicesList, resourcesList] = await Promise.all([
      getterOfServicesForStaff(staffId),
      getterOfStaffList(),
    ]);
    const couldBeDeleted =
      hasMoreThenOneStaff(resourcesList) && !hasAssignedServices(servicesList);

    const actions = { deletable: couldBeDeleted };
    return actions;
  }
}

export async function deleteResourceById(
  staffId,
  deleterOfResourceIdById: (resourceId: string) => Promise<any>,
) {
  const res = await deleterOfResourceIdById(staffId);
  return res;
}

export async function editStaffAsResource(
  staff: StaffDto,
  getterOfBusinessInfoView: () => Promise<GetInfoViewResponse>,
  getterOfBusinessResource: () => Promise<Resource>,
  getterOfStaffById: (resourcesIds: string[]) => Promise<ListResourcesResponse>,
  updaterOfResource: (resource: Resource) => Promise<UpdateResourceResponse>,
) {
  const [
    listResourcesResponse,
    businessResources,
    businessInfoView,
  ] = await Promise.all([
    getterOfStaffById([staff.id]),
    getterOfBusinessResource(),
    getterOfBusinessInfoView(),
  ]);

  const existingStaffResource = listResourcesResponse.resources[0];
  const resource = mapStaffToResource(staff, businessInfoView.timeZone);
  if (!staff.workingHours) {
    resource.schedules[0] = existingStaffResource.schedules[0];
    linkStaffScheduleToBusinessSchedule(
      resource,
      businessResources,
      businessInfoView.timeZone,
    );
  }
  overrideValuesFromExistingResource(resource, existingStaffResource);
  const res = await updaterOfResource(resource);
  return res;
}

function overrideValuesFromExistingResource(
  newResource: Resource,
  existingResource: Resource,
) {
  newResource.tags = existingResource.tags;
  newResource.id = existingResource.id;
  newResource.schedules[0].id = existingResource.schedules[0].id;
  newResource.schedules[0].availability.start =
    existingResource.schedules[0].availability.start;
}

export async function updateBusinessResource(
  businessInfo: Business,
  getterOfBusinessResource: () => Promise<Resource>,
  updaterOfResource: (resource: Resource) => Promise<UpdateResourceResponse>,
) {
  const businessResource = await getterOfBusinessResource();
  const schedule = mapWorkingHoursToSchedule(
    businessInfo.workingHours,
    businessInfo.timeZone,
  );
  businessResource.schedules[0].intervals = schedule.intervals;
  const res = await updaterOfResource(businessResource);
  return res;
}
