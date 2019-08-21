import { GatekeeperServer } from '@wix/ambassador-gatekeeper-server/rpc';
export async function getPermissions(metasiteId, aspects) {
  const user = await GatekeeperServer()
    .AuthorizationUserInfoService()(aspects)
    .fetchUserInfo([metasiteId], ['calendar']);

  return user.permissionsInSite[metasiteId].permissions || [];
}
