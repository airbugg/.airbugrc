import { Chance } from 'chance';
import { deleteACategory } from './category';
import { aServiceResponseWithPlan } from '../../../../test/builders/rpc-custom/service';
import { DeleteServiceRequest } from '@wix/ambassador-services-server';
import { getOfferingTypeFromSchedules } from '../../mappers/offering/service-to-offering';
import { OfferingTypes } from '../../../dto/offerings/offerings.consts';
import { aListServicesResponse } from '@wix/ambassador-services-catalog-server/builders';
describe('category adapter', () => {
  let chance;
  beforeEach(() => {
    chance = new Chance();
  });
  it('should delete category and all services with that category', async () => {
    const listServicesResponse = aListServicesResponse()
      .withServices([aServiceResponseWithPlan().build()])
      .build();
    const categoryId: string = chance.guid();
    const mockDeleterOfCategory = jest.fn();
    const mockGetterOfServicesByCategory = jest
      .fn()
      .mockResolvedValue(listServicesResponse);
    const mockDeleteOfService = jest.fn();
    const res = await deleteACategory(
      categoryId,
      mockDeleterOfCategory,
      mockGetterOfServicesByCategory,
      mockDeleteOfService,
    );
    const deleteCategoryParam = mockDeleterOfCategory.mock.calls[0][0];
    const deleteServiceParam: DeleteServiceRequest =
      mockDeleteOfService.mock.calls[0][0];
    expect(deleteCategoryParam).toBe(categoryId);
    expect(deleteServiceParam).toEqual({
      id: listServicesResponse.services[0].service.id,
      notifyParticipants: false,
      preserveFutureSessionsWithParticipants:
        getOfferingTypeFromSchedules(
          listServicesResponse.services[0].schedules,
        ) === OfferingTypes.INDIVIDUAL,
    });
  });
});
