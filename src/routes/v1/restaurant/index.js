'use strict';

/**
 * Router do bloco restaurant — /api/v1/restaurant
 *
 * Estrutura de URL:
 *   /api/v1/restaurant/:restaurantId/...
 *
 * Toda rota exige:
 *   1. authenticateJWT
 *   2. requireRestaurantAccess (qualquer role de staff)
 *   3. assertRestaurantMembership (valida que o user pertence ao restaurante)
 */

const { Router } = require('express');
const { validate } = require('../../../middlewares/validate.middleware');
const { authenticateJWT } = require('../../../middlewares/auth.v1.middleware');
const { requireRestaurantAccess } = require('../../../middlewares/rbac.middleware');
const { CreateRestaurantSchema } = require('../../../validations/v1/restaurant.validation');
const {
  loadRestaurantContext,
  assertRestaurantMembership,
} = require('../../../middlewares/ownership.middleware');

const profileRoutes = require('./profile.routes');
const categoryRoutes = require('./categories.routes');
const productRoutes = require('./products.routes');
const addonRoutes = require('./addons.routes');
const comboRoutes = require('./combos.routes');
const couponRoutes = require('./coupons.routes');
const hoursRoutes = require('./hours.routes');
const deliveryZoneRoutes = require('./delivery-zones.routes');
const orderRoutes = require('./orders.routes');
const teamRoutes = require('./team.routes');
const dashboardRoutes = require('./dashboard.routes');

const router = Router({ mergeParams: true });

// Guard global: autenticação + role de staff em todos os endpoints
router.use(authenticateJWT, requireRestaurantAccess);

// Carrega req.restaurant + valida membership para todos os sub-recursos de /:restaurantId
router.param('restaurantId', loadRestaurantContext);

router.use('/:restaurantId/profile', assertRestaurantMembership, profileRoutes);
router.use('/:restaurantId/categories', assertRestaurantMembership, categoryRoutes);
router.use('/:restaurantId/products', assertRestaurantMembership, productRoutes);
router.use('/:restaurantId/addons', assertRestaurantMembership, addonRoutes);
router.use('/:restaurantId/combos', assertRestaurantMembership, comboRoutes);
router.use('/:restaurantId/coupons', assertRestaurantMembership, couponRoutes);
router.use('/:restaurantId/hours', assertRestaurantMembership, hoursRoutes);
router.use('/:restaurantId/delivery-zones', assertRestaurantMembership, deliveryZoneRoutes);
router.use('/:restaurantId/orders', assertRestaurantMembership, orderRoutes);
router.use('/:restaurantId/team', assertRestaurantMembership, teamRoutes);
router.use('/:restaurantId/dashboard', assertRestaurantMembership, dashboardRoutes);

// Rota extra: lista restaurantes nos quais o usuário autenticado é membro
const restaurantController = require('../../../controllers/v1/restaurant/restaurant.controller');
router.get('/', restaurantController.listMine);
router.post('/', validate(CreateRestaurantSchema), restaurantController.create);

module.exports = router;
