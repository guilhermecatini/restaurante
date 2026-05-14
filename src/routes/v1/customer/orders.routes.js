'use strict';

/**
 * Rotas de pedidos do cliente — /api/v1/customer/orders
 *
 * GET    /                → histórico de pedidos (paginado)
 * POST   /                → realizar novo pedido
 * GET    /:orderId        → detalhe do pedido (ownership verificado)
 * GET    /:orderId/track  → rastreamento em tempo real do status
 * POST   /:orderId/cancel → cancelar pedido (apenas em estados iniciais)
 */

const { Router } = require('express');
const { validate } = require('../../../middlewares/validate.middleware');
const { PlaceOrderSchema } = require('../../../validations/v1/customer.validation');
const {
  loadOrderContext,
  assertCustomerOrderOwnership,
} = require('../../../middlewares/ownership.middleware');
const orderController = require('../../../controllers/v1/customer/orders.controller');

const router = Router();

// Carrega req.order para rotas com :orderId e verifica ownership
router.param('orderId', loadOrderContext);

/** GET /api/v1/customer/orders */
router.get('/', orderController.list);

/** POST /api/v1/customer/orders */
router.post('/', validate(PlaceOrderSchema), orderController.place);

/** GET /api/v1/customer/orders/:orderId */
router.get('/:orderId', assertCustomerOrderOwnership, orderController.get);

/** GET /api/v1/customer/orders/:orderId/track */
router.get('/:orderId/track', assertCustomerOrderOwnership, orderController.track);

/** POST /api/v1/customer/orders/:orderId/cancel */
router.post('/:orderId/cancel', assertCustomerOrderOwnership, orderController.cancel);

module.exports = router;
