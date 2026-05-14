'use strict';

/**
 * Router raiz da API v1.
 *
 * Monta todos os módulos sob /api/v1:
 *   /api/v1/auth          → autenticação
 *   /api/v1/public        → rotas públicas (sem auth)
 *   /api/v1/customer      → área do cliente (auth + role customer)
 *   /api/v1/restaurant    → backoffice do restaurante (auth + roles de staff)
 */

const { Router } = require('express');
const { sanitize } = require('../../middlewares/sanitize.middleware');

const authRoutes = require('./auth.routes');
const publicRoutes = require('./public.routes');
const customerRoutes = require('./customer');
const restaurantRoutes = require('./restaurant');

const router = Router();

// Sanitização global antes de qualquer rota v1
router.use(sanitize);

// Montagem dos módulos
router.use('/auth', authRoutes);
router.use('/public', publicRoutes);
router.use('/customer', customerRoutes);
router.use('/restaurant', restaurantRoutes);

module.exports = router;
