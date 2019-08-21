import {
  ListUserPremiumAssetsResponse,
  PremiumDataViewRetrieverServer,
} from '@wix/ambassador-premium-data-view-retriever-server/rpc';
import { aListUserPremiumAssetsResponse } from '@wix/ambassador-premium-data-view-retriever-server/builders';

export function stubGetPremiumAssets(
  request = () => true,
  responce: ListUserPremiumAssetsResponse = aListUserPremiumAssetsResponse().build(),
) {
  ambassadorServer
    .createStub(PremiumDataViewRetrieverServer)
    .UserPremiumAssetsServiceV1()
    .listUserPremiumAssets.when(request)
    .resolve(responce);
}
