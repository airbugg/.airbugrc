import axios from 'axios';
import {
  BusinessServer,
  BusinessType,
  PremiumInfo,
} from '@wix/ambassador-business-server/rpc';
import * as WixInstanceNamespace from '@wix/wix-instance';
import {
  BookingsOwnerMixedFlowScope,
  ClientBackOfficeScope,
  SchedulerMixedFlowScope,
  SchedulerNewClientScope,
  SiteOwnerOnPublicSegmentLoggedInScope,
  SiteOwnerOnPublicSegmentScope,
} from '../../src/adapters/petri/scopes';
import { stubGetPremiumAssets } from '../builders/helpers/premium-stub';
import { GatekeeperServer } from '@wix/ambassador-gatekeeper-server/rpc';
import {
  anUserInfoPerSite,
  anUserInfo,
} from '@wix/ambassador-gatekeeper-server/builders';
import * as btoa from 'btoa';
import { Chance } from 'chance';

describe('Owner Config', () => {
  const decodedInstance: WixInstanceNamespace.DecodedInstance = {
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
    string: new Date(),
  };

  function createInstanceFrom(content) {
    return `dl3xosbn1Zyge14tDpVOxv6yNAEgLUQ4TrqUZAEmFRc.${btoa(
      JSON.stringify(content),
    )}`;
  }
  function stubGetPermissions(
    metaSiteId = decodedInstance.metaSiteId,
    userInfo = anUserInfo().build(),
  ) {
    return ambassadorServer
      .createStub(GatekeeperServer)
      .AuthorizationUserInfoService()
      .fetchUserInfo.when((metasiteIds, scopes) => {
        return metasiteIds.includes(metaSiteId) && scopes.includes('calendar');
      })
      .resolve(
        anUserInfoPerSite()
          .withPermissionsInSite({
            [metaSiteId]: userInfo,
          })
          .build(),
      );
  }

  function setupMocksForGetBusinessConfig() {
    const storyId = 'storyId';
    const metasiteId = jest
      .spyOn(WixInstanceNamespace, 'parse')
      .mockReturnValue(decodedInstance);

    const bookingsBusinessServerStub = ambassadorServer.createStub(
      BusinessServer,
    );
    bookingsBusinessServerStub
      .Business()
      .getInfo.when({})
      .resolve({
        language: 'en',
        errors: [],
        businessType: BusinessType.ON_LOCATION,
        premiumInfo: PremiumInfo.WIX_PREMIUM,
      });
  }

  async function createOwnerConfigRequest(metaSiteId = '') {
    const url = app.getUrl('/owner/config');
    const response = await axios.get(url, {
      headers: {
        authorization: createInstanceFrom({ metaSiteId }),
      },
    });
    return response;
  }

  beforeEach(() => {
    petriServer.onConductAllInScopes(scopes => []);
  });

  beforeEach(() => stubGetPermissions());

  it('should get the activeFeatures from owner config', async () => {
    setupMocksForGetBusinessConfig();
    stubGetPremiumAssets();
    const response = await createOwnerConfigRequest();
    const bookingsConfig = response.data;
    expect(bookingsConfig.activeFeatures).toBeDefined();
  });

  it('should get the authorizationInfo from owner config', async () => {
    const metaSiteId = decodedInstance.metaSiteId;
    const userInfo = anUserInfo().build();
    setupMocksForGetBusinessConfig();
    stubGetPremiumAssets();
    stubGetPermissions(metaSiteId, userInfo);

    const response = await createOwnerConfigRequest(metaSiteId);
    const bookingsConfig = response.data;
    const authorizationInfo = JSON.parse(bookingsConfig.authorizationInfo);
    expect(authorizationInfo.isOwner).toBe(true);
    expect(authorizationInfo.siteToken).toBe(null);
    expect(authorizationInfo.roles).toEqual([decodedInstance.permissions]);
    expect(authorizationInfo.permissions).toEqual(
      expect.arrayContaining(userInfo.permissions),
    );
  });

  it('should override locale with given as a query params ', async () => {
    setupMocksForGetBusinessConfig();
    stubGetPremiumAssets();
    const url = app.getUrl('/owner/config?locale=zh');
    const response = await axios.get(url);
    const bookingsConfig = response.data;
    expect(bookingsConfig.locale).toBe('zh');
    expect(bookingsConfig.momentLocale).toBe('zh-hk');
  });

  it('should return specs by calling pteri client', async () => {
    stubGetPremiumAssets();
    setupMocksForGetBusinessConfig();
    petriServer.reset();
    const expectedScopes = [
      SchedulerMixedFlowScope,
      ClientBackOfficeScope,
      BookingsOwnerMixedFlowScope,
      SchedulerNewClientScope,
      SiteOwnerOnPublicSegmentScope,
      SiteOwnerOnPublicSegmentLoggedInScope,
    ];
    const experiments = { foo: 'bar', 'specs.bookings.NewPlatform': 'true' };
    petriServer.onConductAllInScopes(scopes => {
      if (scopes.join('') === expectedScopes.join('')) {
        return experiments;
      }
    });
    const url = app.getUrl('/owner/config?locale=zh');
    const response = await axios.get(url);
    const bookingsConfig = response.data;
    expect(bookingsConfig.experiments).toContain(JSON.stringify(experiments));
    expect(bookingsConfig.experimentsMap.foo).toBe(experiments.foo);
  });
});
