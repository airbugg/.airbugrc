import { getBookingsConfig } from './owner-config';
import { aGetInfoViewResponse } from '@wix/ambassador-business-server/builders';
import { PremiumType } from '../../premium/premium';
import { Chance } from 'chance';

const chance = new Chance();
describe('owner config', () => {
  it('should return bookings premium', async () => {
    const premiumType = PremiumType.WIX;
    const config = await getBookingsConfig(
      async () => aGetInfoViewResponse().build(),
      async () => {
        return {};
      },
      async () => premiumType,
    );
    expect(config.premiumType).toBe(premiumType);
  });
});
