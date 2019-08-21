import {
  PremiumAssetFilter,
  PremiumDataViewRetrieverServer,
} from '@wix/ambassador-premium-data-view-retriever-server';

export function getterOfPremuimStatusFactory(aspecs, metaSiteId: string) {
  const service = PremiumDataViewRetrieverServer().UserPremiumAssetsServiceV1()(
    aspecs,
  );
  const filter: PremiumAssetFilter = {
    metaSite: { metaSiteIds: [metaSiteId], includeNotConnectedToSite: true },
  };
  return async () => {
    return service.listUserPremiumAssets({ filter });
  };
}
