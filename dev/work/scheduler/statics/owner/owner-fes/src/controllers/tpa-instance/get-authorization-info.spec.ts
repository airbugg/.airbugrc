import { getAuthorizationInfo } from './get-authorization-Info';
import { WixInstanceAdapter } from './create-instance-adapter';
import { Chance } from 'chance';

const random = new Chance();
describe('AuthorizationInfo', () => {
  const decodedInstance = {
    instanceId: '21b6b5b1-bfee-451e-95ee-d2c1eeab3e4a',
    appDefId: '13d21c63-b5ec-5912-8397-c3a5ddb27a97',
    metaSiteId: '839d589f-6d48-4039-9d91-f28e8666a9c7',
    signDate: '2019-01-03T12:40:14.372Z',
    uid: '60033846-c64a-45c2-a5e8-4192aec227b7',
    permissions: 'OWNER',
    ipAndPort: '91.199.119.253/36536',
    vendorProductId: null,
    demoMode: false,
    originInstanceId: 'e0579c49-4502-46ad-8787-bb56da6f0b0c',
    biToken: 'a22bed2e-d2a6-0527-087f-204f68cd978d',
    siteOwnerId: '60033846-c64a-45c2-a5e8-4192aec227b7',
    siteMemberId: '60033846-c64a-45c2-a5e8-4192aec227b7',
  };
  it('should create AuthorizationInfo object', async () => {
    const wixInstanceAdapters: WixInstanceAdapter = new WixInstanceAdapter(
      decodedInstance,
    );
    const permissions = [random.string()];
    expect(getAuthorizationInfo(wixInstanceAdapters, permissions)).toEqual({
      isOwner: true,
      ownerId: decodedInstance.siteOwnerId,
      permissions: [decodedInstance.permissions, ...permissions],
      roles: [decodedInstance.permissions],
      siteToken: null,
    });
  });
});
