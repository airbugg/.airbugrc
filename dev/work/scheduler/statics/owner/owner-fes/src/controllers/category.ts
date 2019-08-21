import {
  categoriesList,
  deleteACategory,
  updateACategory,
  createACategory,
} from '../adapters/offerings/category/category';
import {
  categoryUpdater,
  deleterOfOfferingFactory,
  deleterOfCategoryFactory,
  createCategoryFactory,
  getCategoriesListFactory,
} from '../adapters/offerings/services-server-rpc';
import { getterOfServiceListByQueryFactory } from '../adapters/offerings/services-catalog-rpc';

export async function createCategory(req, res, next) {
  let categoryResponse;
  let categoryId;
  if (req.body.name === '') {
    res.sendStatus(400);
  } else {
    try {
      categoryResponse = await createACategory(
        createCategoryFactory(req.aspects),
        getCategoriesListFactory(req.aspects),
        req.body,
      );
      categoryId = categoryResponse.category.id;
    } catch (e) {
      throw new Error(
        `CreateCategory: no category object: CreateCategoryRequest: ${JSON.stringify(
          req.body,
        )}. CreateCategoryResponse: ${JSON.stringify(
          categoryResponse,
        )}. Error: ${e}`,
      );
    }
    res.json({ id: categoryId });
  }
}

export async function updateCategory(req, res, next) {
  const response = await updateACategory(
    categoryUpdater(req.aspects),
    req.body,
  );
  res.sendStatus(200);
}

export async function deleteCategory(req, res, next) {
  await deleteACategory(
    req.params.id,
    deleterOfCategoryFactory(req.aspects),
    getterOfServiceListByQueryFactory(req.aspects),
    deleterOfOfferingFactory(req.aspects),
  );
  res.sendStatus(200);
}

export async function getCategories(req, res, next) {
  const categories = await categoriesList(
    getCategoriesListFactory(req.aspects),
  );
  res.json({ categories });
}
