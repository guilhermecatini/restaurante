'use strict';

/**
 * Categorias do cardápio — /api/v1/restaurant/:restaurantId/categories
 *
 * GET    /                  → lista categorias
 * POST   /                  → cria categoria
 * PUT    /:categoryId       → atualiza categoria
 * DELETE /:categoryId       → remove categoria (soft delete)
 * PATCH  /reorder           → reordena categorias
 */

const { Router } = require('express');
const { validate } = require('../../../middlewares/validate.middleware');
const {
  CategorySchema,
  UpdateCategorySchema,
} = require('../../../validations/v1/restaurant.validation');
const { requireRestaurantManager } = require('../../../middlewares/rbac.middleware');
const categoriesController = require('../../../controllers/v1/restaurant/categories.controller');

const router = Router({ mergeParams: true });

router.get('/', categoriesController.list);
router.post('/', requireRestaurantManager, validate(CategorySchema), categoriesController.create);
router.put('/:categoryId', requireRestaurantManager, validate(UpdateCategorySchema), categoriesController.update);
router.delete('/:categoryId', requireRestaurantManager, categoriesController.remove);
router.patch('/reorder', requireRestaurantManager, categoriesController.reorder);

module.exports = router;
