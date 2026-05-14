'use strict';

/**
 * Cupons — /api/v1/restaurant/:restaurantId/coupons
 *
 * GET    /               → lista cupons
 * POST   /               → cria cupom
 * GET    /:couponId       → detalhe
 * PUT    /:couponId       → atualiza cupom
 * DELETE /:couponId       → remove (soft delete)
 * PATCH  /:couponId/status → ativa/inativa
 * GET    /:couponId/redemptions → histórico de resgates do cupom
 */

const { Router } = require('express');
const { validate } = require('../../../middlewares/validate.middleware');
const {
  CouponSchema,
  UpdateCouponSchema,
} = require('../../../validations/v1/restaurant.validation');
const {
  requireRestaurantManager,
} = require('../../../middlewares/rbac.middleware');
const couponsController = require('../../../controllers/v1/restaurant/coupons.controller');

const router = Router({ mergeParams: true });

router.get('/', couponsController.list);
router.post('/', requireRestaurantManager, validate(CouponSchema), couponsController.create);
router.get('/:couponId', couponsController.get);
router.put('/:couponId', requireRestaurantManager, validate(UpdateCouponSchema), couponsController.update);
router.delete('/:couponId', requireRestaurantManager, couponsController.remove);
router.patch('/:couponId/status', requireRestaurantManager, couponsController.toggleStatus);
router.get('/:couponId/redemptions', requireRestaurantManager, couponsController.listRedemptions);

module.exports = router;
