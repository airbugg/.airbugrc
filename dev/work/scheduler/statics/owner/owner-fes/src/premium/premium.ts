import { ListUserPremiumAssetsResponse } from '@wix/ambassador-premium-data-view-retriever-server';

const connectDomainPackage = 'WixBookingsConnectDomain';
const comboPackage = 'WixBookingsCombo';
const unlimitedPackage = 'WixBookingsUnlimited';
const ecommercePackage = 'WixBookingsEcommerce';
const bookingsPrimeUnlimited = 'BookingsPrimeUnlimited';
const bookingsPrimeEcommerce = 'BookingsPrimeEcommerce';
const bookingsPrimeVIP = 'BookingsPrimeVIP';
const bokingsPrimeUnlimitedStore = 'BookingsPrimeUnlimitedStore';
const bookingsPrimeVIPStore = 'BookingsPrimeVIPStore';
const bookingsPrimeConnectDomain = 'BookingsPrimeConnectDomain';
const bookingsPrimeCombo = 'BookingsPrimeCombo';
const bookingsVideo = 'Bookings_Unlimited';
const newBookings = 'bookings';
const newBookingsCapital = 'Bookings';

export const bookingsPremiumPackageIds = [
  connectDomainPackage,
  comboPackage,
  unlimitedPackage,
  ecommercePackage,
  bookingsPrimeUnlimited,
  bookingsPrimeEcommerce,
  bookingsPrimeVIP,
  bokingsPrimeUnlimitedStore,
  bookingsPrimeVIPStore,
  bookingsPrimeConnectDomain,
  bookingsPrimeCombo,
  bookingsVideo,
  newBookings,
  newBookingsCapital,
];

function hasAnyPremium(premiumAssetsResponse) {
  return (
    premiumAssetsResponse.assets && premiumAssetsResponse.assets.length > 0
  );
}

export async function getPremiumType(
  packageId: string,
  getterOfSitePremiumStatus: () => Promise<ListUserPremiumAssetsResponse>,
): Promise<PremiumType> {
  if (bookingsPremiumPackageIds.includes(packageId)) {
    return PremiumType.BOOKINGS;
  }
  const premiumAssetsResponse = await getterOfSitePremiumStatus();
  if (hasAnyPremium(premiumAssetsResponse)) {
    return PremiumType.WIX;
  }
  return PremiumType.NONE;
}

export enum PremiumType {
  NONE = 'NONE',
  WIX = 'WIX',
  BOOKINGS = 'BOOKINGS',
}
