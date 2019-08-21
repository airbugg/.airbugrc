import axios from 'axios';
import { Chance } from 'chance';
import {
  CreateCategoryResponse,
  ServicesServer,
} from '@wix/ambassador-services-server/rpc';
import {
  aCategory,
  aCreateCategoryResponse,
} from '@wix/ambassador-services-server/builders';
import { CategoryDtoBuilder } from '../../builders/dto/offerings-category.dto.builder';
import { ServicesCatalogServer } from '@wix/ambassador-services-catalog-server/rpc';
import { aServiceResponseWithPlan } from '../../builders/rpc-custom/service';
import { aListServicesResponse } from '@wix/ambassador-services-catalog-server/builders';
import { getOfferingTypeFromSchedules } from '../../../src/adapters/mappers/offering/service-to-offering';
import { OfferingTypes } from '../../../src/dto/offerings/offerings.consts';

describe('Categories', () => {
  const chance = new Chance();

  describe('create a category ', () => {
    it('rpc for create category is called', async () => {
      const name = chance.name();
      const order = chance.integer({ min: 0, max: 10 });
      const categoryId = chance.guid();
      const response: CreateCategoryResponse = aCreateCategoryResponse()
        .withCategory(
          aCategory()
            .withName(name)
            .withId(categoryId)
            .withCustomProperties({ order: order.toString() })
            .build(),
        )
        .build();

      ambassadorServer
        .createStub(ServicesServer)
        .CategoriesService()
        .create.when(() => true)
        .resolve(response);

      ambassadorServer
        .createStub(ServicesServer)
        .CategoriesService()
        .list.when(() => true)
        .resolve({ categories: [] });

      const res = await axios.post(app.getUrl(`/owner/categories`), {
        name,
        order,
      });

      expect(res.status).toBe(200);
      expect(res.data.id).toBe(categoryId);
    });

    it('should throw bad request if category name is empty string', async () => {
      const name = '';
      const order = chance.integer({ min: 0, max: 10 });
      try {
        await axios.post(app.getUrl(`/owner/categories`), {
          name,
          order,
        });
      } catch (e) {
        expect(e.message).toContain(400);
      }
    });
  });

  describe('delete a category', () => {
    it('rpc for delete category is called', async () => {
      const categoryId = chance.guid();
      const onDeleteCategory = jest.fn();
      const onDeleteService = jest.fn();
      const serviceListResponse = aListServicesResponse()
        .withServices([aServiceResponseWithPlan().build()])
        .build();
      const servicesServer = ambassadorServer.createStub(ServicesServer);
      const servicesCatalogServer = ambassadorServer.createStub(
        ServicesCatalogServer,
      );
      servicesServer
        .CategoriesService()
        .delete.when(() => true)
        .call(onDeleteCategory);
      servicesServer
        .ServicesService()
        .delete.when(() => true)
        .call(onDeleteService);
      servicesCatalogServer
        .ServicesCatalog()
        .list.when(() => true)
        .resolve(serviceListResponse);
      const res = await axios.delete(
        app.getUrl(`/owner/categories/${categoryId}`),
      );

      const expectedPreserveFutureSessionsWithParticipants =
        getOfferingTypeFromSchedules(
          serviceListResponse.services[0].schedules,
        ) === OfferingTypes.INDIVIDUAL;
      expect(res.status).toBe(200);
      expect(onDeleteCategory).toHaveBeenCalledWith({ id: categoryId });
      expect(onDeleteService).toHaveBeenCalledWith({
        id: serviceListResponse.services[0].service.id,
        preserveFutureSessionsWithParticipants: expectedPreserveFutureSessionsWithParticipants,
        notifyParticipants: false,
      });
    });
  });

  describe('update a category', () => {
    it('rpc for update category is called', async () => {
      const categoryId = chance.guid();
      const someName = chance.word();
      const onUpdate = jest.fn();
      const order = chance.integer({ min: 0, max: 10 });
      const someCategoryDto = new CategoryDtoBuilder()
        .withId(categoryId)
        .withName(someName)
        .withOrder(order)
        .build();

      const servicesServer = ambassadorServer.createStub(ServicesServer);
      servicesServer
        .CategoriesService()
        .update.when(() => true)
        .call(onUpdate);

      const res = await axios.put(
        app.getUrl(`/owner/categories`),
        someCategoryDto,
      );

      expect(res.status).toBe(200);
      expect(onUpdate).toHaveBeenCalled();
    });
  });
});
