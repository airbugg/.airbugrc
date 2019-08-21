import {
  ListServicesRequest,
  ServicesCatalogServer,
} from '@wix/ambassador-services-catalog-server/rpc';
import { makeLogged } from '../rpc-executor';

export function getterOfCouponEligibleServicesFactory(aspects) {
  const catalogServer = getCatalogServer(aspects);
  return async (req: ListServicesRequest) => {
    return makeLogged(catalogServer.list)(req);
  };
}

function getCatalogServer(aspects) {
  return ServicesCatalogServer().ServicesCatalog()(aspects);
}
