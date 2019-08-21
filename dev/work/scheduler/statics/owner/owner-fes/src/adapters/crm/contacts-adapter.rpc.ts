import {
  ContactsOrder,
  ContactsOrderDirection,
  QueryContactsRequest,
  V3QueryContactsResponse,
  WixContactsWebapp,
  WixInternalContactsResponse,
} from '@wix/ambassador-wix-contacts-webapp';

export function queryContactsFactory(
  aspects,
): (req: QueryContactsRequest) => Promise<V3QueryContactsResponse> {
  const contactServer = WixContactsWebapp().ContactsService()(aspects);
  return (request: QueryContactsRequest): Promise<V3QueryContactsResponse> => {
    return contactServer.query(request);
  };
}

export function searchContactsFactory(
  metaSiteId: string,
  searchText: string,
  pageSize: number = 25,
  aspects,
): () => Promise<WixInternalContactsResponse> {
  const wixInternalContactsFacade = WixContactsWebapp().WixInternalContactsFacade()(
    aspects,
  );
  return (): Promise<WixInternalContactsResponse> => {
    const orderList: ContactsOrder = {
      direction: ContactsOrderDirection.ascending,
      field: 'name',
    };
    return wixInternalContactsFacade.getContacts(
      metaSiteId,
      pageSize,
      [orderList],
      null,
      searchText,
    );
  };
}

//metaSiteId: guid, pageSize: Int, orderList: ContactsOrder[], tag?: String, query?: String): Promise<WixInternalContactsResponse>
