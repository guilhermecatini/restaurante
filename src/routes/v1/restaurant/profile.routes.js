'use strict';

/**
 * Perfil do restaurante — /api/v1/restaurant/:restaurantId/profile
 *
 * GET    /       → dados do restaurante
 * PUT    /       → atualiza perfil
 * PATCH  /status → abre/fecha o restaurante
 * DELETE /       → desativa restaurante (apenas owner)
 */

const { Router } = require('express');
const { validate } = require('../../../middlewares/validate.middleware');
const {
  UpdateRestaurantSchema,
} = require('../../../validations/v1/restaurant.validation');
const {
  requireRestaurantOwner,
  requireRestaurantManager,
} = require('../../../middlewares/rbac.middleware');
const profileController = require('../../../controllers/v1/restaurant/profile.controller');

const router = Router({ mergeParams: true });

router.get('/', profileController.get);
router.put('/', requireRestaurantManager, validate(UpdateRestaurantSchema), profileController.update);
router.patch('/status', requireRestaurantManager, profileController.toggleStatus);
router.delete('/', requireRestaurantOwner, profileController.deactivate);

module.exports = router;
