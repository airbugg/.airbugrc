import { wrapAsync } from './index';
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '../controllers/category';
export function setCategoriesRoutes(app) {
  app.get(
    '/owner/categories',
    wrapAsync((req, res, next) => getCategories(req, res, next)),
  );

  app.post(
    '/owner/categories',
    wrapAsync((req, res, next) => createCategory(req, res, next)),
  );

  app.put(
    '/owner/categories',
    wrapAsync((req, res, next) => updateCategory(req, res, next)),
  );

  app.delete(
    '/owner/categories/:id',
    wrapAsync((req, res, next) => deleteCategory(req, res, next)),
  );
}
