import {
  getActiveFeatures,
  nonPremiumActiveFeatures,
  premiumActiveFeatures,
} from './active-features';
import { Chance } from 'chance';
import { bookingsPremiumPackageIds, PremiumType } from './premium';

const chance = new Chance();
describe('active features', () => {
  it('should return none premium active Features when non bookings premium ', () => {
    expect(getActiveFeatures(PremiumType.WIX)).toEqual(
      nonPremiumActiveFeatures,
    );
  });
  it('should return none premium active Features', () => {
    expect(getActiveFeatures(PremiumType.NONE)).toEqual(
      nonPremiumActiveFeatures,
    );
  });
  it('should return premium active Features', () => {
    expect(getActiveFeatures(PremiumType.BOOKINGS)).toEqual(
      premiumActiveFeatures,
    );
  });
});
