'use strict';

/**
 * Rotas de avaliações do cliente — /api/v1/customer/reviews
 *
 * POST   /restaurants               → avaliar restaurante (vinculado a um pedido)
 * POST   /orders/:orderId           → avaliar experiência do pedido
 * GET    /                          → lista avaliações feitas pelo cliente
 */

const { Router } = require('express');
const { validate } = require('../../../middlewares/validate.middleware');
const {
  RestaurantReviewSchema,
  OrderReviewSchema,
} = require('../../../validations/v1/customer.validation');
const { loadOrderContext, assertCustomerOrderOwnership } =
  require('../../../middlewares/ownership.middleware');
const reviewController = require('../../../controllers/v1/customer/reviews.controller');

const router = Router();

router.param('orderId', loadOrderContext);

/** GET /api/v1/customer/reviews */
router.get('/', reviewController.listMine);

/** POST /api/v1/customer/reviews/restaurants */
router.post('/restaurants', validate(RestaurantReviewSchema), reviewController.reviewRestaurant);

/** POST /api/v1/customer/reviews/orders/:orderId */
router.post(
  '/orders/:orderId',
  assertCustomerOrderOwnership,
  validate(OrderReviewSchema),
  reviewController.reviewOrder
);

module.exports = router;
