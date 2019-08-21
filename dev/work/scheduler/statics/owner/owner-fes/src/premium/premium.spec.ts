import {
  bookingsPremiumPackageIds,
  getPremiumType,
  PremiumType,
} from './premium';
import { Chance } from 'chance';
import {
  aListUserPremiumAssetsResponse,
  aPremiumAsset,
} from '@wix/ambassador-premium-data-view-retriever-server/builders';

const chance = new Chance();
describe('premium type bookings model', () => {
  it('should return premium type Wix', async () => {
    const vendorProductId: string = undefined;
    const getterOfPremiumStatus = async () =>
      aListUserPremiumAssetsResponse()
        .withAssets([aPremiumAsset().build()])
        .build();
    expect(await getPremiumType(vendorProductId, getterOfPremiumStatus)).toBe(
      PremiumType.WIX,
    );
  });
  it('should return premium type bookings', async () => {
    const vendorProductId: string = bookingsPremiumPackageIds[0];
    const getterOfPremiumStatus = async () => null;
    expect(await getPremiumType(vendorProductId, getterOfPremiumStatus)).toBe(
      PremiumType.BOOKINGS,
    );
  });

  it('should return premium type Bookings', async () => {
    const vendorProductId: string = chance.guid();
    const premiumAssetsResponse = aListUserPremiumAssetsResponse().build();
    delete premiumAssetsResponse.assets;
    const getterOfPremiumStatus = async () => premiumAssetsResponse;

    expect(await getPremiumType(vendorProductId, getterOfPremiumStatus)).toBe(
      PremiumType.NONE,
    );
  });
});
