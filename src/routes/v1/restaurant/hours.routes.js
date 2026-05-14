'use strict';

/**
 * Horários de funcionamento — /api/v1/restaurant/:restaurantId/hours
 *
 * GET    /        → lista todos os horários configurados
 * PUT    /        → substitui horários em bulk (todos os dias da semana)
 * PATCH  /:hourId → atualiza um turno específico
 */

const { Router } = require('express');
const { validate } = require('../../../middlewares/validate.middleware');
const {
  OperatingHourSchema,
  BulkOperatingHoursSchema,
} = require('../../../validations/v1/restaurant.validation');
const { requireRestaurantManager } = require('../../../middlewares/rbac.middleware');
const hoursController = require('../../../controllers/v1/restaurant/hours.controller');

const router = Router({ mergeParams: true });

router.get('/', hoursController.list);
router.put('/', requireRestaurantManager, validate(BulkOperatingHoursSchema), hoursController.bulkUpdate);
router.patch('/:hourId', requireRestaurantManager, validate(OperatingHourSchema), hoursController.updateOne);

module.exports = router;
