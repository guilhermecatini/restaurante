'use strict';

/**
 * Router do bloco customer — /api/v1/customer
 *
 * Toda rota aqui exige:
 *   1. authenticateJWT
 *   2. requireCustomer (user_type = 'customer')
 */

const { Router } = require('express');
const { authenticateJWT } = require('../../../middlewares/auth.v1.middleware');
const { requireCustomer } = require('../../../middlewares/rbac.middleware');

const profileRoutes = require('./profile.routes');
const addressRoutes = require('./addresses.routes');
const favoriteRoutes = require('./favorites.routes');
const cartRoutes = require('./cart.routes');
const orderRoutes = require('./orders.routes');
const reviewRoutes = require('./reviews.routes');

const router = Router();

// Guard global: todos os endpoints do bloco exigem autenticação + role customer
router.use(authenticateJWT, requireCustomer);

router.use('/profile', profileRoutes);
router.use('/addresses', addressRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/reviews', reviewRoutes);

module.exports = router;
