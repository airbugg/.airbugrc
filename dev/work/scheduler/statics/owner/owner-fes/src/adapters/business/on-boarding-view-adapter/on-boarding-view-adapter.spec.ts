import { Chance } from 'chance';
import {
  getBusinessSetupStatus,
  updateSetupStatus,
} from './on-boarding-view-adapter';
import { BusinessSetupStatusDto } from '../../../dto/business-setup.dto';
import { PremiumType } from '../../../premium/premium';
import { WixInstanceAdapter } from '../../../controllers/tpa-instance/create-instance-adapter';
import {
  aGetServiceResponse,
  aListServicesResponse,
} from '@wix/ambassador-services-catalog-server/builders';
import {
  aGetOnBoardingStatusResponse,
  anOnboardingStatus,
} from '@wix/ambassador-business-server/builders';

describe('business setup status:', () => {
  const chance = new Chance();
  let wixInstanceAdapter: WixInstanceAdapter;
  beforeEach(() => {
    wixInstanceAdapter = new WixInstanceAdapter({});
  });

  describe('get the business setup', () => {
    it('should retrieve has payments', async () => {
      const hasPayments = chance.bool();
      const getterOfListService = async () => aListServicesResponse().build();
      const onboardingViewGetter = async () =>
        aGetOnBoardingStatusResponse()
          .withOnboardingStatus(
            anOnboardingStatus()
              .withPaymentsMethodsConnected(hasPayments)
              .withServicesReviewed(chance.bool())
              .build(),
          )
          .build();
      const getterOfPremuimType = async () => PremiumType.WIX;
      const res: BusinessSetupStatusDto = await getBusinessSetupStatus(
        onboardingViewGetter,
        getterOfListService,
        getterOfPremuimType,
      );

      expect(res.hasPayments).toBe(hasPayments);
    });

    it('should retrieve premium type', async () => {
      wixInstanceAdapter = new WixInstanceAdapter({
        vendorProductId: chance.guid(),
      });
      const onboardingViewGetter = async () =>
        aGetOnBoardingStatusResponse()
          .withOnboardingStatus(
            anOnboardingStatus()
              .withServicesReviewed(false)
              .build(),
          )
          .build();
      const premiumType = PremiumType.WIX;
      const res: BusinessSetupStatusDto = await getBusinessSetupStatus(
        onboardingViewGetter,
        async () => aListServicesResponse().build(),
        async () => premiumType,
      );

      expect(res.premiumType).toBe(premiumType);
    });

    it('should retrieve reviewed working hours, reviewed email', async () => {
      const reviewedHours = chance.bool();
      const reviewedEmail = chance.bool();
      const onboardingViewGetter = async () =>
        aGetOnBoardingStatusResponse()
          .withOnboardingStatus(
            anOnboardingStatus()
              .withWorkingHoursReviewed(reviewedHours)
              .withEmailReviewed(reviewedEmail)
              .build(),
          )
          .build();

      const res: BusinessSetupStatusDto = await getBusinessSetupStatus(
        onboardingViewGetter,
        async () => aListServicesResponse().build(),
        async () => null,
      );
      expect(res.reviewedWorkingHours).toBe(reviewedHours);
      expect(res.reviewedEmail).toBe(reviewedEmail);
    });

    it('should indicate from template when has services and reviewedServices false', async () => {
      const onBoardingStatus = aGetOnBoardingStatusResponse()
        .withOnboardingStatus(
          anOnboardingStatus()
            .withServicesReviewed(false)
            .build(),
        )
        .build();
      const onboardingViewGetter = async () => onBoardingStatus;

      const res: BusinessSetupStatusDto = await getBusinessSetupStatus(
        onboardingViewGetter,
        async () =>
          aListServicesResponse()
            .withServices([aGetServiceResponse().build()])
            .build(),
        async () => null,
      );
      expect(res.fromTemplate).toBe(true);
    });
  });

  describe('update', () => {
    it('should allow update of "reviewed email"', async () => {
      const reviewedEmail = chance.bool();
      const businessCustomPropertiesUpdater = jest.fn();

      await updateSetupStatus(businessCustomPropertiesUpdater, {
        reviewedEmail,
      });

      expect(businessCustomPropertiesUpdater).toHaveBeenCalledWith({
        emailReviewed: true,
      });
    });

    it('should allow update of "reviewed working hours"', async () => {
      const reviewedWorkingHours = chance.bool();
      const businessCustomPropertiesUpdater = jest.fn();

      await updateSetupStatus(businessCustomPropertiesUpdater, {
        reviewedWorkingHours,
      });

      expect(businessCustomPropertiesUpdater).toHaveBeenCalledWith({
        workingHoursReviewed: true,
      });
    });
  });
});
