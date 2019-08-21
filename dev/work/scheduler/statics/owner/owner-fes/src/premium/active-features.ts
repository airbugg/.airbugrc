import { getPremiumType, PremiumType } from './premium';

export function getActiveFeatures(premiumType: PremiumType) {
  if (premiumType === PremiumType.BOOKINGS) {
    return premiumActiveFeatures;
  }
  return nonPremiumActiveFeatures;
}

export const nonPremiumActiveFeatures = {
  payments: false,
  groups: false,
  reminders: false,
  staffMembers: true,
  course: false,
};

export const premiumActiveFeatures = {
  payments: true,
  groups: true,
  reminders: true,
  staffMembers: true,
  course: true,
};
