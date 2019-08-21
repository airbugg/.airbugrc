import {
  createResourceFromStaff,
  deleteResourceById,
  editStaffAsResource,
  getAllowActions,
  linkScheduleWhenNeeded,
} from '../adapters/resources/resources-adapter';
import * as Authorization from '@wix/wix-authorization';
import { Resource } from '@wix/ambassador-resources-server';
import { getInstance } from './tpa-instance/decode-wix-instance';
import { mapResourcesToStaff } from '../adapters/mappers/staff/resorces-to-staff-mapper';
import {
  createResourceFactory,
  deleteResponseFactory,
  getAllStaffAsResourceFactory,
  getterOfBusinessResourceFactory,
  getterOfStaffByIdFactory,
  updaterOfResourceFactory,
  getResourceOfAUser,
} from '../adapters/resources/resources-adapter-rpc';
import { getAllSyncStatuses } from '../adapters/external-calendar';
import { getterOfServicesForStaffFactory } from '../adapters/offerings/services-catalog-rpc';
import { StaffDto } from '../dto/staff.dto';
import { getBusinessInfoViewFactory } from '../adapters/business/busniess-adapter-rpc';
import {
  addTagForCreatedStaff,
  mapStaffToResource,
} from '../adapters/mappers/staff/staff-to-resorces-mapper';
import { conductAllScopesFactory } from '../adapters/petri/conduct-all-scopes';
import { staffHasRole } from '../adapters/staff';
import { createInstanceAdapter } from './tpa-instance/create-instance-adapter';

export async function getStaffList(
  req,
  res,
  gatekeeprClient,
  apiGatewayClient,
  petri,
) {
  let canManageOtherStaffMembers = false;
  const userId = req.aspects.session.userGuid;
  const experiments = await conductAllScopesFactory(req.aspects, petri)();
  if (experiments['specs.wos.BookingsFitness'] === 'true') {
    const metaSiteId = createInstanceAdapter(getInstance(req)).getMetaSiteId();
    try {
      canManageOtherStaffMembers = await gatekeeprClient
        .client(req.aspects)
        .authorize(metaSiteId, {
          scope: 'calendar',
          action: 'manage-schedules',
        })
        .then(() => true);
    } catch (e) {
      canManageOtherStaffMembers = false;
    }
  }

  function resolveStaffList() {
    if (
      canManageOtherStaffMembers ||
      experiments['specs.wos.BookingsFitness'] === 'false' //overridden as false as part of migration. do not clean until migration is complete
    ) {
      return getAllStaffAsResourceFactory(req.aspects)();
    }
    return getResourceOfAUser(userId, req.aspects);
  }

  const [listResourcesResponse, syncStatuses] = await Promise.all([
    resolveStaffList(),
    getAllSyncStatuses(req.aspects),
  ]);

  const syncStatusByStaffId = !syncStatuses.statuses
    ? []
    : syncStatuses.statuses.reduce((result, syncStatus) => {
        result[syncStatus.resourceId] = syncStatus;
        return result;
      }, {});

  const staff = [],
    deletedStaff = [];
  if (listResourcesResponse.resources) {
    listResourcesResponse.resources.forEach((resource: Resource) => {
      const staffDto = mapResourcesToStaff(
        resource,
        syncStatusByStaffId[resource.id],
      );
      if (resource.status === 'DELETED') {
        deletedStaff.push(staffDto);
      } else {
        staff.push(staffDto);
      }
    });
  }
  res.send({
    deletedStaff,
    staff,
  });
}

export async function createStaff(req, res) {
  const createdId = await createResourceFromStaff(
    req.body,
    getBusinessInfoViewFactory(req.aspects),
    createResourceFactory(req.aspects),
    getterOfBusinessResourceFactory(req.aspects),
  );
  res.send({ id: createdId });
}
export async function staffAllowActions(req, res, petri) {
  const staffId = req.params.staffId;
  const experiments = await conductAllScopesFactory(req.aspects, petri)();
  const hasRoleResolver = id => staffHasRole(id, req.aspects);
  const actions = await getAllowActions(
    staffId,
    getterOfServicesForStaffFactory(req.aspects),
    getAllStaffAsResourceFactory(req.aspects),
    experiments,
    hasRoleResolver,
  );
  res.send(actions);
}

export async function deleteStaff(req, res) {
  const staffId = req.params.staffId;
  const deleteRes = await deleteResourceById(
    staffId,
    deleteResponseFactory(req.aspects),
  );
  res.send(deleteRes);
}
export async function editStaff(req, res) {
  const staff: StaffDto = req.body;
  const deleteRes = await editStaffAsResource(
    staff,
    getBusinessInfoViewFactory(req.aspects),
    getterOfBusinessResourceFactory(req.aspects),
    getterOfStaffByIdFactory(req.aspects),
    updaterOfResourceFactory(req.aspects),
  );
  res.send(deleteRes);
}
export function staffConverter(req, res, next) {
  const timezone = req.body.timezone;
  const staffs = req.body.staffs;
  const businessResource = req.body.bussinesResorce;
  const resources = staffs.map(staff => {
    return mapStaffToResource(staff, timezone);
  });
  resources.forEach(resource => addTagForCreatedStaff(resource));
  resources.forEach(resource =>
    linkScheduleWhenNeeded(
      async () => Promise.resolve(businessResource),
      resource,
      timezone,
    ),
  );
  res.send({ resources });
}
