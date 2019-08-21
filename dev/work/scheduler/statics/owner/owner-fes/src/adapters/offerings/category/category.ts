import {
  DeleteServiceRequest,
  DeleteServiceResponse,
  ListCategoryResponse,
  UpdateCategoryRequest,
  UpdateCategoryResponse,
  CreateCategoryRequest,
  CreateCategoryResponse,
} from '@wix/ambassador-services-server';
import { CategoryDto } from '../../../dto/offerings/offerings-category.dto';
import {
  Category,
  GetServiceResponse,
  ListServicesResponse,
  Query,
} from '@wix/ambassador-services-catalog-server/rpc';
import {
  convertServiceCategoryToOfferingCategory,
  getOfferingTypeFromSchedules,
} from '../../mappers/offering/service-to-offering';
import { buildQueryOfServicesByCategoryId } from '../services-catalog-rpc';
import { OfferingTypes } from '../../../dto/offerings/offerings.consts';

export async function deleteACategory(
  categoryId: string,
  deleterOfCategory: (id: string) => Promise<any>,
  getterOfServiceListByQuery: (q: Query) => Promise<ListServicesResponse>,
  deleterOfOffering: (
    req: DeleteServiceRequest,
  ) => Promise<DeleteServiceResponse>,
) {
  const offeringList = await getterOfServiceListByQuery(
    buildQueryOfServicesByCategoryId(categoryId),
  );
  let deleteOfferingPromiseList = [];

  await deleterOfCategory(categoryId);
  if (offeringList.services) {
    deleteOfferingPromiseList = offeringList.services.map(
      (offering: GetServiceResponse) => {
        const preserveFutureSessionsWithParticipants =
          getOfferingTypeFromSchedules(offering.schedules) ===
          OfferingTypes.INDIVIDUAL;
        return deleterOfOffering({
          id: offering.service.id,
          preserveFutureSessionsWithParticipants,
          notifyParticipants: false,
        });
      },
    );
  }
  deleteOfferingPromiseList = [...deleteOfferingPromiseList];
  const res = await Promise.all(deleteOfferingPromiseList);
  return res;
}

export async function createACategory(
  categoryCreator: (
    category: CreateCategoryRequest,
  ) => Promise<CreateCategoryResponse>,
  categoryLister: () => Promise<ListCategoryResponse>,
  offeringCategory,
) {
  const categoriesResp = await categoryLister();
  const order = categoriesResp.categories
    ? categoriesResp.categories.length
    : 0;

  const category: Category = {
    name: offeringCategory.name,
    id: offeringCategory.id ? offeringCategory.id : null,
    customProperties: {
      order: offeringCategory.order ? `${offeringCategory.order}` : `${order}`,
    },
    status: null,
  };

  return categoryCreator({
    category,
  });
}

export async function updateACategory(
  updaterOfCategory: (
    request: UpdateCategoryRequest,
  ) => Promise<UpdateCategoryResponse>,
  OfferingCategory: CategoryDto,
) {
  const category: Category = {
    id: OfferingCategory.id,
    name: OfferingCategory.name,
    customProperties: {
      order: OfferingCategory.order ? `${OfferingCategory.order}` : '0',
    },
    status: null,
  };

  return updaterOfCategory({ category });
}

export async function categoriesList(getCategoriesList) {
  const res: ListCategoryResponse = await getCategoriesList();
  if (!res.categories) {
    return [];
  }

  return res.categories
    .map(convertServiceCategoryToOfferingCategory)
    .sort((a, b) => a.order - b.order);
}
