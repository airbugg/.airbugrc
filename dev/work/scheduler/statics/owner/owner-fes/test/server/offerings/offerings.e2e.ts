import axios from 'axios';
import { Chance } from 'chance';
import { PaymentType } from '../../../src/dto/offerings/offering.dto';
import { IndividualOfferingDtoBuilder } from '../../builders/dto/individual-offering.dto.builder';
import { ServicesServer } from '@wix/ambassador-services-server/rpc';
import {
  aCreateServiceResponse,
  aSchedule,
} from '@wix/ambassador-services-server/builders';
import { ResourcesServer } from '@wix/ambassador-resources-server/rpc';
import {
  aListResourcesResponse,
  anAvailability,
  anAvailabilityConstraints,
  aResource,
} from '@wix/ambassador-resources-server/builders';
import {
  GetServiceResponse,
  ServicesCatalogServer,
} from '@wix/ambassador-services-catalog-server/rpc';
import {
  aGetServiceResponse,
  aService,
} from '@wix/ambassador-services-catalog-server/builders';
import { PricingPlanBenefitsServer } from '@wix/ambassador-pricing-plan-benefits-server/rpc';
import {
  aBenefit,
  aBenefitWithPlanInfo,
  aListResponse,
  anAddResourcesResponse,
  aPlanInfo,
  aPricingPlanDto,
} from '@wix/ambassador-pricing-plan-benefits-server/builders';
import { BusinessServer } from '@wix/ambassador-business-server/rpc';
import { stubGetBusinessProperties } from '../../builders/helpers/business-stub';
import { OfferingTypes } from '../../../src/dto/offerings/offerings.consts';
import {
  aGetInfoViewResponse,
  aGetPropertiesResponse,
  anUpdateOnBoardingStatusResponse,
} from '@wix/ambassador-business-server/builders';

describe('An Offering', () => {
  const chance = new Chance();

  beforeEach(() => {
    petriServer.onConductAllInScopes(scopes => []);
  });

  describe('create an offering', () => {
    const someBusinessResource = () =>
      aResource()
        .withSchedules([
          aSchedule()
            .withAvailability(
              anAvailability()
                .withConstraints(anAvailabilityConstraints().build())
                .build(),
            )
            .build(),
        ])
        .withTag('business')
        .build();

    it('rpc for create service is called', async () => {
      const resourcesServerStub = ambassadorServer.createStub(ResourcesServer);
      resourcesServerStub
        .ResourcesService()
        .list.when(() => true)
        .resolve(
          aListResourcesResponse()
            .withResources([someBusinessResource()])
            .build(),
        );

      ambassadorServer
        .createStub(ServicesCatalogServer)
        .ServicesCatalog()
        .list.when(() => true)
        .resolve({ services: [] });

      const planId = chance.guid();
      const offering = new IndividualOfferingDtoBuilder()
        .withPaymentType(PaymentType.ALL)
        .withPricingPlans([
          aPlanInfo()
            .withId(planId)
            .build(),
        ])
        .build();
      const offeringId = chance.guid();
      const response = aCreateServiceResponse()
        .withId(offeringId)
        .build();

      const servicesServer = ambassadorServer.createStub(ServicesServer);
      servicesServer
        .ServicesService()
        .create.when(() => true)
        .resolve(response);

      const benefitsServer = ambassadorServer.createStub(
        PricingPlanBenefitsServer,
      );
      benefitsServer
        .BenefitManagement()
        .list.when(() => true)
        .resolve(
          aListResponse()
            .withBenefitsWithPlanInfo([
              aBenefitWithPlanInfo()
                .withPlanInfo(
                  aPlanInfo()
                    .withId(planId)
                    .build(),
                )
                .withBenefit(
                  aBenefit()
                    .withId(planId)
                    .build(),
                )
                .build(),
            ])
            .build(),
        );
      benefitsServer
        .BenefitManagement()
        .addResources.when(() => true)
        .resolve(anAddResourcesResponse().build());

      ambassadorServer
        .createStub(BusinessServer)
        .Business()
        .getProperties.when(() => true)
        .resolve(aGetPropertiesResponse().build());

      ambassadorServer
        .createStub(BusinessServer)
        .Business()
        .updateOnboardingStatus.when(() => true)
        .resolve(anUpdateOnBoardingStatusResponse().build());

      ambassadorServer
        .createStub(BusinessServer)
        .Business()
        .getInfo.when(() => true)
        .resolve(
          aGetInfoViewResponse()
            .withTimeZone(chance.timezone().name)
            .build(),
        );

      const res = await axios.post(app.getUrl(`/owner/offerings`), offering);
      expect(res.status).toBe(200);
      expect(res.data.id).toBe(offeringId);
    });

    xit('should create a list of offerings', () => {
      expect(true).toBeTruthy();
    });

    xit("shouldn't crash when no schedule for staff", async () => {
      const resourcesServerStub = ambassadorServer.createStub(ResourcesServer);
      const staff = aResource()
        .withSchedules(null)
        .build();
      resourcesServerStub
        .ResourcesService()
        .list.when(() => true)
        .resolve(
          aListResourcesResponse()
            .withResources([staff])
            .build(),
        );

      const offering = new IndividualOfferingDtoBuilder()
        .withPaymentType(PaymentType.ALL)
        .withStaffIds([staff.id])
        .build();
      const response = aCreateServiceResponse().build();

      const servicesServer = ambassadorServer.createStub(ServicesServer);
      servicesServer
        .ServicesService()
        .create.when(() => true)
        .resolve(response);

      const res = await axios.post(app.getUrl(`/owner/offerings`), offering);
      expect(res.status).toBe(200);
      expect(res.data.id).toBe(response.id);
    });
  });

  describe('get an offering', () => {
    xit('rpc for get service is called', async () => {
      const offeringId = chance.guid();
      const response = aGetServiceResponse()
        .withService(
          aService()
            .withId(offeringId)
            .build(),
        )
        .build();

      ambassadorServer
        .createStub(ServicesCatalogServer)
        .ServicesCatalog()
        .get.when(request => {
          return true;
        })
        .resolve(response);

      const res = await axios(app.getUrl(`/owner/offerings/${offeringId}`));
      expect(res.status).toBe(200);
      expect(res.data.id).toBe(offeringId);
    });
  });

  describe('update an offering', () => {
    it('calls update service rpc', async () => {
      const offering = new IndividualOfferingDtoBuilder()
        .withPaymentType(PaymentType.ALL)
        .withPricingPlans([
          aPricingPlanDto()
            .withId(chance.guid())
            .build(),
        ])
        .build();
      const offeringId = chance.guid();
      const response = aCreateServiceResponse()
        .withId(offeringId)
        .build();

      const notifyUsers = chance.bool();
      const updaterOfOffering = jest.fn();
      updaterOfOffering.mockResolvedValue(response);

      ambassadorServer
        .createStub(ServicesServer)
        .ServicesService()
        .update.when(() => true)
        .call(updaterOfOffering);
      const getService: GetServiceResponse = aGetServiceResponse()
        .withService(
          aService()
            .withScheduleIds(chance.guid())
            .build(),
        )
        .withSchedules([aSchedule().build()])
        .build();

      ambassadorServer
        .createStub(ServicesCatalogServer)
        .ServicesCatalog()
        .get.when(() => true)
        .resolve(getService);

      ambassadorServer
        .createStub(ResourcesServer)
        .ResourcesService()
        .list.when(() => true)
        .resolve(aListResourcesResponse().build());

      ambassadorServer
        .createStub(BusinessServer)
        .Business()
        .updateOnboardingStatus.when(() => true)
        .resolve(anUpdateOnBoardingStatusResponse().build());

      ambassadorServer
        .createStub(BusinessServer)
        .Business()
        .getProperties.when(() => true)
        .resolve(aGetPropertiesResponse().build());

      ambassadorServer
        .createStub(BusinessServer)
        .Business()
        .getInfo.when(() => true)
        .resolve(
          aGetInfoViewResponse()
            .withTimeZone(chance.timezone().name)
            .build(),
        );

      const benefitsServerStub = ambassadorServer.createStub(
        PricingPlanBenefitsServer,
      );

      benefitsServerStub
        .BenefitManagement()
        .list.when(() => true)
        .resolve(
          aListResponse()
            .withBenefitsWithPlanInfo(
              offering.pricingPlanInfo.pricingPlans.map(plan =>
                aBenefitWithPlanInfo()
                  .withPlanInfo(
                    aPlanInfo()
                      .withId(plan.id)
                      .build(),
                  )
                  .withBenefit(
                    aBenefit()
                      .withId(plan.id)
                      .build(),
                  )
                  .build(),
              ),
            )
            .build(),
        );
      //stub
      stubGetBusinessProperties();
      const res = await axios.put(
        app.getUrl(`/owner/offerings/?notifyUsers=${notifyUsers.toString()}`),
        offering,
      );

      expect(res.status).toBe(200);
      expect(res.data.id).toBe(offeringId);
      expect(updaterOfOffering.mock.calls[0][0].notifyParticipants).toBe(
        notifyUsers,
      );
    });
  });

  describe('delete an offering', () => {
    it('calls delete service rpc', async () => {
      const offeringId = chance.guid();
      const onDeleted = jest.fn();
      const notifyUsers = chance.bool();
      const servicesServer = ambassadorServer.createStub(ServicesServer);
      servicesServer
        .ServicesService()
        .delete.when(() => true)
        .call(onDeleted);

      ambassadorServer
        .createStub(ServicesCatalogServer)
        .ServicesCatalog()
        .get.when(() => true)
        .resolve(
          aGetServiceResponse()
            .withSchedules([
              aSchedule()
                .withTags([OfferingTypes.INDIVIDUAL])
                .build(),
            ])
            .build(),
        );

      const res = await axios.delete(
        app.getUrl(
          `/owner/offerings/${offeringId}/?notifyUsers=${notifyUsers.toString()}`,
        ),
      );

      expect(res.status).toBe(200);
      expect(onDeleted).toHaveBeenCalledWith({
        id: offeringId,
        notifyParticipants: notifyUsers,
        preserveFutureSessionsWithParticipants: true,
      });
    });
  });
});
