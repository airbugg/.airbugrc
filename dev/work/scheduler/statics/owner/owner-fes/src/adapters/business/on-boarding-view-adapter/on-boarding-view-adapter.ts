import {
  GetOnBoardingStatusResponse,
  UpdateOnBoardingStatusRequest,
} from '@wix/ambassador-business-server';
import { BusinessSetupStatusDto } from '../../../dto/business-setup.dto';
import { ListServicesResponse } from '@wix/ambassador-services-catalog-server/rpc';
import { PremiumType } from '../../../premium/premium';
import { GetterOfferingsList } from '../../offerings/services-catalog-rpc';

export async function getBusinessSetupStatus(
  getterOfOnBoardingView: () => Promise<GetOnBoardingStatusResponse>,
  getterOfServiceList: GetterOfferingsList,
  getterOfPremiumType: () => Promise<PremiumType>,
): Promise<BusinessSetupStatusDto> {
  const [
    onBoardingViewAdapter,
    serviceListResponse,
    premiumType,
  ] = await Promise.all([
    getterOfOnBoardingView(),
    getterOfServiceList(false),
    getterOfPremiumType(),
  ]);

  return {
    fromTemplate: gussIsFromTemplate(
      serviceListResponse,
      onBoardingViewAdapter.onboardingStatus.servicesReviewed,
    ),
    numOfOfferings: getNumOfOfferings(serviceListResponse),
    modifiedOffering: onBoardingViewAdapter.onboardingStatus.servicesReviewed,
    hasPayments: onBoardingViewAdapter.onboardingStatus
      .paymentsMethodsConnected as boolean,
    premiumType,
    reviewedEmail: onBoardingViewAdapter.onboardingStatus.emailReviewed,
    reviewedWorkingHours:
      onBoardingViewAdapter.onboardingStatus.workingHoursReviewed,
  };
}

export async function updateSetupStatus(
  updaterOfOnboardingStatus: (UpdateOnBoardingStatusRequest) => Promise<any>,
  patchMessage: Partial<BusinessSetupStatusDto>,
) {
  const updateOnboarding: UpdateOnBoardingStatusRequest = {};
  if (patchMessage.hasOwnProperty('reviewedEmail')) {
    updateOnboarding.emailReviewed = true;
  }

  if (patchMessage.hasOwnProperty('reviewedWorkingHours')) {
    updateOnboarding.workingHoursReviewed = true;
  }

  if (patchMessage.hasOwnProperty('servicesReviewed')) {
    updateOnboarding.servicesReviewed = true;
  }
  return updaterOfOnboardingStatus(updateOnboarding);
}

function gussIsFromTemplate(
  serviceListResponse: ListServicesResponse,
  servicesReviewed: boolean,
): boolean {
  if (getNumOfOfferings(serviceListResponse) > 0 && !servicesReviewed) {
    return true;
  }
  return false;
}

function getNumOfOfferings(serviceListResponse: ListServicesResponse) {
  return serviceListResponse.services ? serviceListResponse.services.length : 0;
}

function propertyExistsAndMatches(
  map: Map<string, string>,
  key: string,
  value: string,
): boolean {
  return map.has(key) && map.get(key) === value;
}
