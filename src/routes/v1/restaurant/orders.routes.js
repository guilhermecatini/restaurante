'use strict';

/**
 * Pedidos do backoffice — /api/v1/restaurant/:restaurantId/orders
 *
 * GET    /                        → lista pedidos (com filtros de status, data)
 * GET    /:orderId                 → detalhe completo do pedido
 * PATCH  /:orderId/status          → atualiza status do pedido
 * GET    /:orderId/items           → itens do pedido
 */

const { Router } = require('express');
const { validate } = require('../../../middlewares/validate.middleware');
const { UpdateOrderStatusSchema } = require('../../../validations/v1/restaurant.validation');
const {
  loadOrderContext,
  assertRestaurantOrderOwnership,
} = require('../../../middlewares/ownership.middleware');
const ordersController = require('../../../controllers/v1/restaurant/orders.controller');

const router = Router({ mergeParams: true });

router.param('orderId', loadOrderContext);

router.get('/', ordersController.list);
router.get('/:orderId', assertRestaurantOrderOwnership, ordersController.get);
router.patch('/:orderId/status', assertRestaurantOrderOwnership, validate(UpdateOrderStatusSchema), ordersController.updateStatus);
router.get('/:orderId/items', assertRestaurantOrderOwnership, ordersController.listItems);

module.exports = router;
