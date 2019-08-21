import {
  BusinessServer,
  GetInfoViewResponse,
  GetOnBoardingStatusResponse,
  GetPropertiesRequest,
  GetPropertiesResponse,
  UpdatePropertiesRequest,
  UpdatePropertiesResponse,
  UpdateOnBoardingStatusRequest,
  UpdateOnBoardingStatusResponse,
} from '@wix/ambassador-business-server';
import { makeLogged } from '../rpc-executor';
export enum BookingPolicyProperty {
  CANCELLATION_POLICY_KEY = 'cancellationPolicy',
  CANCELLATION_LEAD_TIME_AMOUNT_KEY = 'cancellationLeadTime',
  CANCELLATION_LEAD_TIME_UNITS_KEY = 'cancellationLeadTimeUnits',
  BOOK_LEAD_TIME_AMOUNT_KEY = 'bookLeadTime',
  BOOK_LEAD_TIME_UNITS_KEY = 'bookLeadTimeUnits',
  MAX_LEAD_TIME_AMOUNT_KEY = 'maxLeadTimeAmount',
  MAX_LEAD_TIME_UNITS_KEY = 'maxLeadTimeUnits',
  MAX_LEAD_TIME_ENABLED_KEY = 'maxLeadTimeEnabled',
  CALENDAR_TIME_INTERVAL_KEY = 'slotIntervalDefault',
  WAITLIST_WINDOW_AMOUNT_KEY = 'waitingTimeAmount',
  WAITLIST_WINDOW_UNITS_KEY = 'waitingTimeUnits',
  WAITLIST_ENABLED_KEY = 'waitingEnabled',
  WAITLIST_CAPACIY = 'waitlistCapacity',
}

export const ONBOARDING_VIEW_REVIEWED_EMAIL = 'onBoardingViewReviewsEmail';
export const ONBOARDING_VIEW_REVIEWED_WORKING_HOURS =
  'onBoardingViewReviewsEmail';

export function getBusinessInfoViewFactory(aspects) {
  const service = getBusinessService(aspects);
  return async (): Promise<GetInfoViewResponse> => {
    return service.getInfo({});
  };
}

export function getBusinessPropertiesFactory(aspects) {
  const service = getBusinessService(aspects);
  return async (): Promise<GetPropertiesResponse> => {
    const propKeys = Object.values(BookingPolicyProperty);
    const request: GetPropertiesRequest = {
      customProperties: propKeys.map(key => {
        return { propertyName: key };
      }),
    };
    return makeLogged(service.getProperties)(request);
  };
}

export function updaterBusinessPropertiesFactory(
  aspects,
): (UpdatePropertiesRequest) => Promise<UpdatePropertiesResponse> {
  const service = getBusinessService(aspects);
  return async (
    request: UpdatePropertiesRequest,
  ): Promise<UpdatePropertiesResponse> => {
    return makeLogged(service.updateProperties)(request);
  };
}

export function updaterOnBoardingFactory(
  aspects,
): (
  req: UpdateOnBoardingStatusRequest,
) => Promise<UpdateOnBoardingStatusResponse> {
  const service = getBusinessService(aspects);
  return async (
    request: UpdateOnBoardingStatusRequest,
  ): Promise<UpdateOnBoardingStatusResponse> => {
    return makeLogged(service.updateOnboardingStatus)(request);
  };
}

export function getOnBoardingViewFactory(aspects) {
  const service = getBusinessService(aspects);
  return async (): Promise<GetOnBoardingStatusResponse> => {
    return makeLogged(service.getOnBoardingStatus)({});
  };
}

function getBusinessService(aspects) {
  return BusinessServer().Business()(aspects);
}
