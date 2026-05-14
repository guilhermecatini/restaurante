'use strict';

/**
 * Zonas de entrega — /api/v1/restaurant/:restaurantId/delivery-zones
 *
 * GET    /            → lista zonas de entrega
 * POST   /            → cria zona
 * GET    /:zoneId     → detalhe
 * PUT    /:zoneId     → atualiza zona
 * DELETE /:zoneId     → remove (soft delete)
 * PATCH  /:zoneId/status → ativa/inativa zona
 */

const { Router } = require('express');
const { validate } = require('../../../middlewares/validate.middleware');
const {
  DeliveryZoneSchema,
  UpdateDeliveryZoneSchema,
} = require('../../../validations/v1/restaurant.validation');
const { requireRestaurantManager } = require('../../../middlewares/rbac.middleware');
const deliveryZonesController = require('../../../controllers/v1/restaurant/delivery-zones.controller');

const router = Router({ mergeParams: true });

router.get('/', deliveryZonesController.list);
router.post('/', requireRestaurantManager, validate(DeliveryZoneSchema), deliveryZonesController.create);
router.get('/:zoneId', deliveryZonesController.get);
router.put('/:zoneId', requireRestaurantManager, validate(UpdateDeliveryZoneSchema), deliveryZonesController.update);
router.delete('/:zoneId', requireRestaurantManager, deliveryZonesController.remove);
router.patch('/:zoneId/status', requireRestaurantManager, deliveryZonesController.toggleStatus);

module.exports = router;
