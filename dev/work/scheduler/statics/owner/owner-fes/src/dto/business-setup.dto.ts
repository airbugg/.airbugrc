import { PremiumType } from '../premium/premium';

export interface BusinessSetupStatusDto {
  fromTemplate: boolean;
  numOfOfferings: number;
  modifiedOffering: boolean;
  reviewedWorkingHours: boolean;
  reviewedEmail: boolean;
  hasPayments: boolean;
  premiumType: PremiumType;
}
