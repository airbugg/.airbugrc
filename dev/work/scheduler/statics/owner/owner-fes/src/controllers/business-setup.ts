import {
  getOnBoardingViewFactory,
  updaterOnBoardingFactory,
} from '../adapters/business/busniess-adapter-rpc';
import {
  getBusinessSetupStatus,
  updateSetupStatus,
} from '../adapters/business/on-boarding-view-adapter/on-boarding-view-adapter';
import { getterOfferingsListFactory } from '../adapters/offerings/services-catalog-rpc';
import { createInstanceAdapter } from './tpa-instance/create-instance-adapter';
import { getInstance } from './tpa-instance/decode-wix-instance';
import { getPremiumType } from '../premium/premium';
import { getterOfPremuimStatusFactory } from '../adapters/premium-rpc';

export async function getBusinessSetup(req, res) {
  const wixInstanceAdapter = createInstanceAdapter(getInstance(req));
  const getterOfPremiumType = getPremiumType.bind(
    null,
    wixInstanceAdapter.getVendorProductId(),
    getterOfPremuimStatusFactory(
      req.aspects,
      wixInstanceAdapter.getMetaSiteId(),
    ),
  );
  const businessSetup = await getBusinessSetupStatus(
    getOnBoardingViewFactory(req.aspects),
    getterOfferingsListFactory(req.aspects),
    getterOfPremiumType,
  );
  res.send(businessSetup);
}

export async function updateOnBoarding(aspects, patchMessage) {
  const updaterOnBoarding = updaterOnBoardingFactory(aspects);
  return updateSetupStatus(updaterOnBoarding, patchMessage);
}

export async function updateBusinessSetup(req, res) {
  const patchMessage = req.body;
  await updateOnBoarding(req.aspects, patchMessage);
  res.sendStatus(200);
}
