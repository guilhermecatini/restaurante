'use strict';

/**
 * Produtos do cardápio — /api/v1/restaurant/:restaurantId/products
 *
 * GET    /                              → lista produtos (com filtros)
 * POST   /                              → cria produto
 * GET    /:productId                    → detalhe do produto
 * PUT    /:productId                    → atualiza produto
 * DELETE /:productId                    → remove produto (soft delete)
 * PATCH  /:productId/status             → ativa/inativa produto
 * PATCH  /:productId/stock              → atualiza estoque
 * POST   /:productId/images             → adiciona imagem
 * DELETE /:productId/images/:imageId   → remove imagem
 * GET    /:productId/addon-groups       → lista grupos de adicionais vinculados
 * POST   /:productId/addon-groups       → vincula grupo de adicional ao produto
 * DELETE /:productId/addon-groups/:addonGroupId → desvincula grupo
 */

const { Router } = require('express');
const { validate } = require('../../../middlewares/validate.middleware');
const {
  ProductSchema,
  UpdateProductSchema,
  ProductAddonGroupSchema,
} = require('../../../validations/v1/restaurant.validation');
const { requireRestaurantManager } = require('../../../middlewares/rbac.middleware');
const productsController = require('../../../controllers/v1/restaurant/products.controller');

const router = Router({ mergeParams: true });

router.get('/', productsController.list);
router.post('/', requireRestaurantManager, validate(ProductSchema), productsController.create);

router.get('/:productId', productsController.get);
router.put('/:productId', requireRestaurantManager, validate(UpdateProductSchema), productsController.update);
router.delete('/:productId', requireRestaurantManager, productsController.remove);
router.patch('/:productId/status', requireRestaurantManager, productsController.toggleStatus);
router.patch('/:productId/stock', requireRestaurantManager, productsController.updateStock);

// Imagens
router.post('/:productId/images', productsController.addImage);
router.delete('/:productId/images/:imageId', productsController.removeImage);

// Vínculos com grupos de adicionais
router.get('/:productId/addon-groups', productsController.listAddonGroups);
router.post('/:productId/addon-groups', requireRestaurantManager, validate(ProductAddonGroupSchema), productsController.linkAddonGroup);
router.delete('/:productId/addon-groups/:addonGroupId', requireRestaurantManager, productsController.unlinkAddonGroup);

module.exports = router;
