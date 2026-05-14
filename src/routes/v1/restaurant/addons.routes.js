'use strict';

/**
 * Adicionais e grupos — /api/v1/restaurant/:restaurantId/addons
 *
 * GET    /groups                    → lista grupos de adicionais
 * POST   /groups                    → cria grupo
 * PUT    /groups/:groupId           → atualiza grupo
 * DELETE /groups/:groupId           → remove grupo (soft delete)
 * GET    /groups/:groupId/items     → lista adicionais do grupo
 * POST   /groups/:groupId/items     → cria adicional no grupo
 * PUT    /items/:addonId            → atualiza adicional
 * DELETE /items/:addonId            → remove adicional (soft delete)
 */

const { Router } = require('express');
const { validate } = require('../../../middlewares/validate.middleware');
const {
  AddonGroupSchema,
  UpdateAddonGroupSchema,
  AddonSchema,
  UpdateAddonSchema,
} = require('../../../validations/v1/restaurant.validation');
const { requireRestaurantManager } = require('../../../middlewares/rbac.middleware');
const addonsController = require('../../../controllers/v1/restaurant/addons.controller');

const router = Router({ mergeParams: true });

// Grupos
router.get('/groups', addonsController.listGroups);
router.post('/groups', requireRestaurantManager, validate(AddonGroupSchema), addonsController.createGroup);
router.put('/groups/:groupId', requireRestaurantManager, validate(UpdateAddonGroupSchema), addonsController.updateGroup);
router.delete('/groups/:groupId', requireRestaurantManager, addonsController.removeGroup);

// Adicionais por grupo
router.get('/groups/:groupId/items', addonsController.listItems);
router.post('/groups/:groupId/items', requireRestaurantManager, validate(AddonSchema), addonsController.createItem);

// Adicionais individuais
router.put('/items/:addonId', requireRestaurantManager, validate(UpdateAddonSchema), addonsController.updateItem);
router.delete('/items/:addonId', requireRestaurantManager, addonsController.removeItem);

module.exports = router;
