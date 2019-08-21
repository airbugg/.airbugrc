import axios from 'axios';
import {
  Day,
  Interval,
  Query,
  Resource,
  ResourcesServer,
  ResourceStatus,
  Schedule,
} from '@wix/ambassador-resources-server/rpc';

import {
  aCreateResourceResponse,
  aListResourcesRequest,
  aListResourcesResponse,
  anInterval,
  aRecurringInterval,
  aResource,
  aSchedule,
  aListStaffResponse,
  aStaff,
} from '@wix/ambassador-resources-server/builders';
import { Chance } from 'chance';
import { StaffDto } from '../../src/dto/staff.dto';
import { ExternalCalendarServer } from '@wix/ambassador-external-calendar-server/rpc';
import { aSyncStatusResponse } from '@wix/ambassador-external-calendar-server/builders';
import { ServicesCatalogServer } from '@wix/ambassador-services-catalog-server/rpc';
import { aListServicesResponse } from '@wix/ambassador-services-catalog-server/builders';
import {
  buildASimpleStaffFromResource,
  validStaff,
} from '../builders/dto/staff.dto';
import { buildAWorkingHours } from '../builders/dto/working-hours.dto.builder';
import { stubGetBusinessInfoView } from '../builders/helpers/business-stub';
import { aStaffResource } from '../builders/rpc-custom/resource-builder';
import { aNineToFive7DaysAWeekSchedule } from '../builders/rpc-custom/schedule-builder';
import { server as GatekeeperTestkit } from '@wix/wix-gatekeeper-testkit';
import { createInstanceFrom } from './util/instance-generator';
const wixHeaders = require('@wix/wix-http-headers');

describe('Staff ', () => {
  const gatekeeperTestkit = GatekeeperTestkit();
  gatekeeperTestkit.beforeAndAfter();

  beforeEach(() => {
    petriServer.onConductAllInScopes(() => ({
      'specs.wos.BookingsFitness': 'true',
    }));
  });

  const chance = new Chance();

  // const headers = { authorization: createInstanceFrom({ uid: chance.guid() }) };

  function createHeaders(userGuid = chance.guid()) {
    return wixHeaders()
      .withSession({ userGuid })
      .headers();
  }

  function buildAResourceResponse(schedules: Schedule[]) {
    const resource = aResource()
      .withId(chance.guid())
      .withPhone(chance.phone())
      .withEmail(chance.email())
      .withSchedules(schedules)
      .withDescription(null)
      .withImages(null)
      .build();

    return aCreateResourceResponse()
      .withResource(resource)
      .build();
  }

  function buildAResource(schedule) {
    return aResource()
      .withDescription(null)
      .withEmail(chance.email())
      .withId(chance.guid())
      .withSchedules([schedule])
      .withName(`${chance.first()} ${chance.last()}`)
      .withStatus(ResourceStatus.CREATED)
      .build();
  }

  function buildASchedule(aInterval) {
    const recurringInterval = aRecurringInterval()
      .withInterval(aInterval)
      .withFrequency({ repetition: 1 })
      .withStart(new Date().toISOString())
      .build();
    return aSchedule()
      .withIntervals([recurringInterval])
      .withAvailability(null)
      .build();
  }

  function buildAnInterval() {
    return anInterval()
      .withDaysOfWeek(Day.MON)
      .withDuration(120)
      .withMinuteOfHour(30)
      .withHourOfDay(9)
      .build();
  }

  function mockResourceListRPC(
    resources: Resource[] = [],
    atag = [],
    ids = [],
  ) {
    const listResourcesRequest = aListResourcesRequest()
      .withQuery({} as Query)
      .build();

    const listResourcesResponse = aListResourcesResponse()
      .withResources(resources)
      .build();

    ambassadorServer
      .createStub(ResourcesServer)
      .ResourcesService()
      .list.when(() => true)
      .resolve(listResourcesResponse);

    const statuses =
      resources && resources[0]
        ? [{ resourceId: resources[0].id, calendar: null, status: null }]
        : [];
    const statusResponse = aSyncStatusResponse()
      .withStatuses(statuses)
      .build();

    ambassadorServer
      .createStub(ExternalCalendarServer)
      .SyncService()
      .list.when(() => true)
      .resolve(statusResponse);
  }

  function simulatePermissionToManageSchedulesOn(metaSiteId) {
    gatekeeperTestkit.givenUserPermissionHandler(
      (_, receivedMetasiteIds, receivedPermission) => {
        const { scope, action } = receivedPermission;
        return (
          receivedMetasiteIds === metaSiteId &&
          scope === 'calendar' &&
          action === 'manage-schedules'
        );
      },
    );
  }

  function simulateAbsenceOfPermissionToManageSchedulesOn(metaSiteId) {
    gatekeeperTestkit.givenUserPermissionHandler(
      (_, receivedMetasiteIds, receivedPermission) => {
        const { scope, action } = receivedPermission;
        return !(
          receivedMetasiteIds === metaSiteId &&
          scope === 'calendar' &&
          action === 'manage-schedules'
        );
      },
    );
  }

  describe('StaffDto List', () => {
    it('returns only staff member assigned to current user if he has no permissions to manage other staff members', async () => {
      const currentUserId = chance.guid();
      const metaSiteId = chance.guid();
      const staff = aStaff()
        .withWixUserId(currentUserId)
        .build();
      const aInterval: Interval = buildAnInterval();
      const schedule: Schedule = buildASchedule(aInterval);
      const authorization = createInstanceFrom({ metaSiteId });

      simulateAbsenceOfPermissionToManageSchedulesOn(metaSiteId);
      mockResourceListRPC([
        aResource()
          .withId(staff.id)
          .withStatus(ResourceStatus.CREATED)
          .withSchedules([schedule])
          .build(),
      ]);
      ambassadorServer
        .createStub(ResourcesServer)
        .StaffService()
        .list.when(
          req => req.query.filter === `{"staff.wixUserId":"${currentUserId}"}`,
        )
        .resolve(
          aListStaffResponse()
            .withStaffs([staff])
            .build(),
        );
      const res = await axios(app.getUrl('/owner/staff/'), {
        headers: { authorization, ...createHeaders(currentUserId) },
      });

      expect(res.data.staff.length).toBe(1);
    });

    it('should return an empty list of staff', async () => {
      const metaSiteId = chance.guid();
      simulatePermissionToManageSchedulesOn(metaSiteId);
      const authorization = createInstanceFrom({ metaSiteId });

      const requestedTag = 'staff';
      mockResourceListRPC(null, [requestedTag]);
      const res = await axios(app.getUrl('/owner/staff/'), {
        headers: { authorization },
      });
      expect(res.data.staff.length).toBe(0);
      expect(res.data.deletedStaff.length).toBe(0);
    });

    it('should return staff', async () => {
      const metaSiteId = chance.guid();
      simulatePermissionToManageSchedulesOn(metaSiteId);
      const authorization = createInstanceFrom({ metaSiteId });

      const requestedTag = 'staff';
      const resource = aResource()
        .withImages(null)
        .withSchedules(null)
        .withStatus(ResourceStatus.CREATED)
        .build();
      mockResourceListRPC([resource], [requestedTag]);
      const res = await axios(app.getUrl('/owner/staff/'), {
        headers: { authorization },
      });
      expect(res.data.staff.length).toBe(1);
      expect(res.data.staff[0].image).toBe(null);
    });

    it('should return deleted staff', async () => {
      const metaSiteId = chance.guid();
      simulatePermissionToManageSchedulesOn(metaSiteId);
      const authorization = createInstanceFrom({ metaSiteId });

      const requestedTag = 'staff';
      const resource = aResource()
        .withImages(null)
        .withSchedules(null)
        .withStatus(ResourceStatus.DELETED)
        .build();
      mockResourceListRPC([resource], [requestedTag]);
      const res = await axios(app.getUrl('/owner/staff/'), {
        headers: { authorization },
      });
      expect(res.data.deletedStaff.length).toBe(1);
      expect(res.data.deletedStaff[0].image).toBe(null);
    });

    it('should return the list of staff', async () => {
      const metaSiteId = chance.guid();
      simulatePermissionToManageSchedulesOn(metaSiteId);
      const authorization = createInstanceFrom({ metaSiteId });

      const requestedTag = 'staff';
      const aInterval: Interval = buildAnInterval();
      const schedule: Schedule = buildASchedule(aInterval);
      const resource: Resource = buildAResource(schedule);
      mockResourceListRPC([resource], [requestedTag]);
      const res = await axios(app.getUrl('/owner/staff/'), {
        headers: { authorization },
      });
      const staff = res.data.staff[0];
      const image = staff.image;
      expect(staff.fullName).toBe(resource.name);
      expect(staff.id).toBe(resource.id);
      expect(staff.phone).toBe(resource.phone);
      expect(staff.workingHours.mon[0].startTime).toContain(
        `${aInterval.hourOfDay}:`,
      );
    });
  });

  describe(' Create StaffDto', () => {
    it('Create a StaffDto with working hours', async () => {
      stubGetBusinessInfoView();
      const resourcesServerStub = ambassadorServer.createStub(ResourcesServer);
      const aStaffResourceResponse = buildAResourceResponse(null);
      const staff: StaffDto = buildASimpleStaffFromResource(
        aStaffResourceResponse.resource,
        buildAWorkingHours(),
      );
      resourcesServerStub
        .ResourcesService()
        .create.when(() => true)
        .resolve(aStaffResourceResponse);
      const res = await axios.post(app.getUrl(`/owner/staff`), staff);
      expect(res.data.id).toBe(aStaffResourceResponse.resource.id);
    });

    it('Create a simple StaffDto with link schedule', async () => {
      stubGetBusinessInfoView();
      const resourcesServerStub = ambassadorServer.createStub(ResourcesServer);
      const aStaffResourceResponse = buildAResourceResponse(null);
      const staff: StaffDto = buildASimpleStaffFromResource(
        aStaffResourceResponse.resource,
        null,
      );
      const businessSchedule = buildASchedule(buildAnInterval());
      const aBusinessResourceResponse = aListResourcesResponse()
        .withResources([
          aResource()
            .withSchedules([businessSchedule])
            .build(),
        ])
        .build();

      resourcesServerStub
        .ResourcesService()
        .list.when(() => true)
        .resolve(aBusinessResourceResponse);

      resourcesServerStub
        .ResourcesService()
        .create.when(() => true)
        .resolve(aStaffResourceResponse);

      const res = await axios.post(app.getUrl(`/owner/staff/`), staff);
      expect(res.data.id).toBe(aStaffResourceResponse.resource.id);
    });
  });

  describe('Delete Staff', () => {
    beforeEach(() => {
      petriServer.onConductAllInScopes(() => ({
        'specs.wos.BookingsFitness': 'true',
      }));
    });

    it('could be deleted', async () => {
      const staffId = chance.guid();
      ambassadorServer
        .createStub(ResourcesServer)
        .StaffService()
        .list.when(
          req =>
            req.query.filter ===
            `{"$or" : [{"$and": [{"resource.id": "${staffId}"}, {"staff.hasPendingInvite" : true}]}, {"$and": [{"resource.id": "${staffId}"},{"staff.hasUserId" : true}]}]}`,
        )
        .resolve(
          aListStaffResponse()
            .withStaffs([])
            .build(),
        );
      mockResourceListRPC([aResource().build(), aResource().build()]);
      const servicesCatalogServer = ambassadorServer.createStub(
        ServicesCatalogServer,
      );
      servicesCatalogServer
        .ServicesCatalog()
        .list.when(() => true)
        .resolve(
          aListServicesResponse()
            .withServices([])
            .build(),
        );
      const res = await axios.get(
        app.getUrl(`/owner/staff/actions/${staffId}`),
      );
      expect(res.data.deletable).toEqual(true);
    });

    describe('when Fitness Experiment is off', () => {
      beforeEach(() => {
        petriServer.onConductAllInScopes(() => ({
          'specs.wos.BookingsFitness': 'false',
        }));
      });

      it('could be deleted', async () => {
        mockResourceListRPC([aResource().build(), aResource().build()]);
        const servicesCatalogServer = ambassadorServer.createStub(
          ServicesCatalogServer,
        );
        servicesCatalogServer
          .ServicesCatalog()
          .list.when(() => true)
          .resolve(
            aListServicesResponse()
              .withServices([])
              .build(),
          );
        const staffId = chance.guid();
        const res = await axios.get(
          app.getUrl(`/owner/staff/actions/${staffId}`),
        );
        expect(res.data).toEqual({ deletable: true });
      });
    });

    it('should delete staff', async () => {
      const resourcesServer = ambassadorServer.createStub(ResourcesServer);
      resourcesServer
        .ResourcesService()
        .delete.when(() => true)
        .resolve({});
      const staffId = chance.guid();
      await axios.delete(app.getUrl(`/owner/staff/${staffId}`));
    });
  });

  describe('Edit staff', () => {
    it('Edit staff', async () => {
      const staff = validStaff(buildAWorkingHours());
      stubGetBusinessInfoView();
      const resources = aStaffResource(aNineToFive7DaysAWeekSchedule());
      const resourcesServer = ambassadorServer.createStub(ResourcesServer);
      resourcesServer
        .ResourcesService()
        .list.when(() => true)
        .resolve(
          aListResourcesResponse()
            .withResources([resources])
            .build(),
        );
      resourcesServer
        .ResourcesService()
        .update.when(() => true)
        .resolve({});
      const res = await axios.put(app.getUrl('/owner/staff/'), staff);
      expect(res).toBeDefined();
    });
  });
});
