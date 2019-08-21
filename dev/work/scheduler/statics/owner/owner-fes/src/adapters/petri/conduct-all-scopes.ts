import {
  BookingsOwnerMixedFlowScope,
  ClientBackOfficeScope,
  SchedulerMixedFlowScope,
  SchedulerNewClientScope,
  SiteOwnerOnPublicSegmentScope,
  SiteOwnerOnPublicSegmentLoggedInScope,
} from './scopes';

export function conductAllScopesFactory(
  aspects,
  petri,
): () => Promise<{ [key: string]: string }> {
  return async () => {
    return petri
      .client(aspects)
      .conductAllInScopes(
        SchedulerMixedFlowScope,
        ClientBackOfficeScope,
        BookingsOwnerMixedFlowScope,
        SchedulerNewClientScope,
        SiteOwnerOnPublicSegmentScope,
        SiteOwnerOnPublicSegmentLoggedInScope,
      );
  };
}
