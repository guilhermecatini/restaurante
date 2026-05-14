'use strict';

/**
 * Dashboard do restaurante — /api/v1/restaurant/:restaurantId/dashboard
 *
 * GET  /summary          → resumo operacional do dia
 * GET  /orders-stats     → estatísticas de pedidos por período
 * GET  /revenue          → receita por período
 * GET  /top-products     → produtos mais pedidos
 */

const { Router } = require('express');
const { requireRestaurantManager } = require('../../../middlewares/rbac.middleware');
const dashboardController = require('../../../controllers/v1/restaurant/dashboard.controller');

const router = Router({ mergeParams: true });

router.get('/summary', dashboardController.summary);
router.get('/orders-stats', requireRestaurantManager, dashboardController.ordersStats);
router.get('/revenue', requireRestaurantManager, dashboardController.revenue);
router.get('/top-products', dashboardController.topProducts);

module.exports = router;
