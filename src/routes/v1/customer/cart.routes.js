'use strict';

/**
 * Rotas do carrinho — /api/v1/customer/cart
 *
 * Um cliente pode ter apenas 1 carrinho ativo por restaurante.
 *
 * GET    /                        → busca carrinho ativo (ou vazio)
 * POST   /items                   → adiciona item ao carrinho
 * PUT    /items/:cartItemId        → atualiza quantidade/adicionais de um item
 * DELETE /items/:cartItemId        → remove item do carrinho
 * DELETE /                        → limpa/abandona o carrinho inteiro
 * POST   /validate-coupon         → valida cupom antes de finalizar pedido
 */

const { Router } = require('express');
const { validate } = require('../../../middlewares/validate.middleware');
const {
  AddCartItemSchema,
  UpdateCartItemSchema,
} = require('../../../validations/v1/customer.validation');
const cartController = require('../../../controllers/v1/customer/cart.controller');

const router = Router();

/** GET /api/v1/customer/cart?restaurant_id=X */
router.get('/', cartController.getCart);

/** POST /api/v1/customer/cart/items */
router.post('/items', validate(AddCartItemSchema), cartController.addItem);

/** PUT /api/v1/customer/cart/items/:cartItemId */
router.put('/items/:cartItemId', validate(UpdateCartItemSchema), cartController.updateItem);

/** DELETE /api/v1/customer/cart/items/:cartItemId */
router.delete('/items/:cartItemId', cartController.removeItem);

/** DELETE /api/v1/customer/cart */
router.delete('/', cartController.clearCart);

/** POST /api/v1/customer/cart/validate-coupon  body: { coupon_code, restaurant_id } */
router.post('/validate-coupon', cartController.validateCoupon);

module.exports = router;
