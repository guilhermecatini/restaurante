'use strict';

/**
 * Rotas de favoritos do cliente — /api/v1/customer/favorites
 *
 * GET    /                         → lista restaurantes favoritados
 * POST   /                         → adiciona restaurante aos favoritos
 * DELETE /:restaurantId            → remove dos favoritos
 */

const { Router } = require('express');
const favoritesController = require('../../../controllers/v1/customer/favorites.controller');

const router = Router();

/** GET /api/v1/customer/favorites */
router.get('/', favoritesController.list);

/** POST /api/v1/customer/favorites  body: { restaurant_id } */
router.post('/', favoritesController.add);

/** DELETE /api/v1/customer/favorites/:restaurantId */
router.delete('/:restaurantId', favoritesController.remove);

module.exports = router;
