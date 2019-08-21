import { WixInstanceAdapter } from './create-instance-adapter';

export function getAuthorizationInfo(
  wixInstanceAdapter: WixInstanceAdapter,
  permissions,
) {
  return {
    isOwner: wixInstanceAdapter.isOwner(),
    permissions: [wixInstanceAdapter.getPermissions(), ...permissions],
    roles: [wixInstanceAdapter.getPermissions()],
    ownerId: wixInstanceAdapter.getUserId(),
    siteToken: null,
  };
}
