import { createInstanceAdapter } from './tpa-instance/create-instance-adapter';
import { getInstance } from './tpa-instance/decode-wix-instance';
import { conductAllScopesFactory } from '../adapters/petri/conduct-all-scopes';
import { getBusinessInfoViewFactory } from '../adapters/business/busniess-adapter-rpc';
import { getBookingsConfig } from '../adapters/config/owner-config';
import {
  bookingsSupportedCurrency,
  supportedPaypalCurrencies,
} from '../adapters/business/currency';
import { getMomentLocal } from '../adapters/business/get-moment-local';
import { getAuthorizationInfo } from './tpa-instance/get-authorization-Info';
import { getPremiumType } from '../premium/premium';
import { getterOfPremuimStatusFactory } from '../adapters/premium-rpc';
import { getPermissions } from '../adapters/permissions';

export async function ownerConfig(req, res, next, config, petri) {
  try {
    const wixInstanceAdapter = createInstanceAdapter(getInstance(req));
    const urlRequestLocale = req.query.locale;
    const getterOfBusinessInfoView = getBusinessInfoViewFactory(req.aspects);
    const getterConductAllScopes = conductAllScopesFactory(req.aspects, petri);
    const getterOfPremiumType = getPremiumType.bind(
      null,
      wixInstanceAdapter.getVendorProductId(),
      getterOfPremuimStatusFactory(
        req.aspects,
        wixInstanceAdapter.getMetaSiteId(),
      ),
    );
    const bookingsConfig = await getBookingsConfig(
      getterOfBusinessInfoView,
      getterConductAllScopes,
      getterOfPremiumType,
    );
    const permissions = await getPermissions(
      wixInstanceAdapter.getMetaSiteId(),
      req.aspects,
    );
    addAuthorizationInfo(bookingsConfig, wixInstanceAdapter, permissions);
    addLocales(bookingsConfig, urlRequestLocale);
    addEndPoints(bookingsConfig, config);
    addSupportedCurrency(bookingsConfig);
    res.json(bookingsConfig);
  } catch (e) {
    console.log(e);
    throw e;
  }
}

function addAuthorizationInfo(
  bookingsConfig,
  wixInstanceAdapter,
  permissions: string[],
) {
  bookingsConfig.authorizationInfo = JSON.stringify(
    getAuthorizationInfo(wixInstanceAdapter, permissions),
  );
}

function addLocales(bookingsConfig, urlRequestLocale) {
  const userLanguage = getUserLanguage(bookingsConfig.locale, urlRequestLocale);
  bookingsConfig.locale = userLanguage;
  bookingsConfig.momentLocale = getMomentLocal(userLanguage);
}

function addEndPoints(bookingsConfig, config) {
  bookingsConfig.staticsUrl = config.staticsUrl;
}

function addSupportedCurrency(bookingsConfig) {
  bookingsConfig.supportedCurrencies = JSON.stringify({
    SupportedBookingsCurrencies: bookingsSupportedCurrency,
    SupportedPaypalCurrencies: supportedPaypalCurrencies,
  });
}

function getUserLanguage(
  businessLanguage: string,
  queryLanguage: string,
): string {
  if (queryLanguage) {
    return queryLanguage;
  }
  return businessLanguage;
}
