import { GetInfoViewResponse } from '@wix/ambassador-business-server';
import { getActiveFeatures } from '../../premium/active-features';
import { PremiumType } from '../../premium/premium';

function addNewPlatformFlag(experimentsResults: any) {
  experimentsResults['specs.bookings.NewPlatform'] = 'true';
}

export async function getBookingsConfig(
  getterOfBusinessInfoView: () => Promise<GetInfoViewResponse>,
  getterConductAllScopes: () => Promise<any>,
  getterOfPremiumType: () => Promise<PremiumType>,
) {
  const isPricingPlanEnabled = true;
  const [businessInfoView, experimentsResults, premiumType] = await Promise.all(
    [
      getterOfBusinessInfoView(),
      getterConductAllScopes(),
      getterOfPremiumType(),
    ],
  );
  const activeFeatures = getActiveFeatures(premiumType);
  addNewPlatformFlag(experimentsResults);
  const bookingsConfig = {
    activeFeatures: JSON.stringify(activeFeatures),
    locale: businessInfoView.language,
    experiments: JSON.stringify(experimentsResults),
    experimentsMap: experimentsResults,
    isPricingPlanEnabled,
    premiumType,
  };
  return bookingsConfig;
}
