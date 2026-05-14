'use strict';

/**
 * Combos — /api/v1/restaurant/:restaurantId/combos
 *
 * GET    /               → lista combos
 * POST   /               → cria combo (com items inline)
 * GET    /:comboId        → detalhe
 * PUT    /:comboId        → atualiza combo
 * DELETE /:comboId        → remove (soft delete)
 * PATCH  /:comboId/status → ativa/inativa
 */

const { Router } = require('express');
const { validate } = require('../../../middlewares/validate.middleware');
const {
  ComboSchema,
  UpdateComboSchema,
} = require('../../../validations/v1/restaurant.validation');
const { requireRestaurantManager } = require('../../../middlewares/rbac.middleware');
const combosController = require('../../../controllers/v1/restaurant/combos.controller');

const router = Router({ mergeParams: true });

router.get('/', combosController.list);
router.post('/', requireRestaurantManager, validate(ComboSchema), combosController.create);
router.get('/:comboId', combosController.get);
router.put('/:comboId', requireRestaurantManager, validate(UpdateComboSchema), combosController.update);
router.delete('/:comboId', requireRestaurantManager, combosController.remove);
router.patch('/:comboId/status', requireRestaurantManager, combosController.toggleStatus);

module.exports = router;
