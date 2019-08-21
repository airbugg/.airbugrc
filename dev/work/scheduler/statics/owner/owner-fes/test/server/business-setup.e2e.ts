import axios from 'axios';
import {
  BusinessServer,
  GetOnBoardingStatusResponse,
} from '@wix/ambassador-business-server/rpc';
import {
  aGetOnBoardingStatusResponse,
  aGetPropertiesResponse,
  anOnboardingStatus,
  anUpdatePropertiesResponse,
  aProperty,
} from '@wix/ambassador-business-server/builders';
import {
  ONBOARDING_VIEW_REVIEWED_EMAIL,
  ONBOARDING_VIEW_REVIEWED_WORKING_HOURS,
} from '../../src/adapters/business/busniess-adapter-rpc';
import { PremiumInfo } from '@wix/ambassador-business-server/types';

function aGetOnboardingView(): GetOnBoardingStatusResponse {
  return aGetOnBoardingStatusResponse()
    .withOnboardingStatus(
      anOnboardingStatus()
        .withPremiumInfo(PremiumInfo.BOOKINGS_PREMIUM)
        .withPaymentsMethodsConnected(true)
        .build(),
    )
    .build();
}

xdescribe('Bookings platform', () => {
  it('should return the business setup status', async () => {
    const onBoardingViewResponse = aGetOnboardingView();

    const customProperties = aGetPropertiesResponse()
      .withCustomProperties([
        aProperty()
          .withPropertyName(ONBOARDING_VIEW_REVIEWED_EMAIL)
          .withValue('true')
          .build(),
        aProperty()
          .withPropertyName(ONBOARDING_VIEW_REVIEWED_WORKING_HOURS)
          .withValue('true')
          .build(),
      ])
      .build();

    const bookingsBusinessServerStub = ambassadorServer.createStub(
      BusinessServer,
    );
    bookingsBusinessServerStub
      .Business()
      .getOnBoardingStatus.when(aGetOnboardingView())
      .resolve(onBoardingViewResponse);
    bookingsBusinessServerStub
      .Business()
      .getProperties.when(() => true)
      .resolve(customProperties);

    const res = await axios(app.getUrl('/owner/business/setup'));
    const onBoardingView = res.data;
    expect(onBoardingView.premiumType).toBe('BOOKINGS');
    expect(onBoardingView.hasPayments).toBe(
      onBoardingViewResponse.onboardingStatus.paymentsMethodsConnected,
    );
    expect(onBoardingView.reviewedEmail).toBe(true);
    expect(onBoardingView.reviewedWorkingHours).toBe(true);
  });

  it('should update the business setup status', async () => {
    const patchMessage = { reviewedEmail: true };
    ambassadorServer
      .createStub(BusinessServer)
      .Business()
      .updateProperties.when(() => true)
      .resolve(anUpdatePropertiesResponse().build());

    const res = await axios.patch(
      app.getUrl('/owner/business/setup'),
      patchMessage,
    );
    expect(res.status).toBe(200);
  });
});
