import {
  ResourcesServer,
  Value,
  Query,
} from '@wix/ambassador-resources-server/index';

function registeredOrInvitedStaffFilter(id: string): any {
  return `{"$or" : [{"$and": [{"resource.id": "${id}"}, {"staff.hasPendingInvite" : true}]}, {"$and": [{"resource.id": "${id}"},{"staff.hasUserId" : true}]}]}`;
}

function staffMemberOfUserFilter(uid: string) {
  return `{"staff.wixUserId":"${uid}"}`;
}

export async function getRegisteredOrInvitedMember(staffId, aspects) {
  const filter = registeredOrInvitedStaffFilter(staffId);
  const query: Query = {
    filter: filter as Value,
    fields: null,
    fieldsets: null,
    sort: null,
  };

  const response = await ResourcesServer()
    .StaffService()(aspects)
    .list({ query });

  return response.staffs ? response.staffs[0] : null;
}

export async function getStaffByUid(uid, aspects) {
  const filter = staffMemberOfUserFilter(uid);

  const query: Query = {
    filter: filter as Value,
    fields: null,
    fieldsets: null,
    sort: null,
  };

  const response = await ResourcesServer()
    .StaffService()(aspects)
    .list({ query });

  return response.staffs ? response.staffs[0] : null;
}

export async function staffHasRole(id, aspects) {
  const staff = await getRegisteredOrInvitedMember(id, aspects);

  return Boolean(staff);
}
