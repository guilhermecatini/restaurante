'use strict';

/**
 * Rotas públicas — /api/v1/public
 * Não exigem autenticação. optionalJWT disponível para personalização.
 *
 * GET  /restaurants                      → listagem paginada de restaurantes
 * GET  /restaurants/search               → busca por nome, categoria, etc.
 * GET  /restaurants/:restaurantId        → detalhe do restaurante
 * GET  /restaurants/:restaurantId/menu   → cardápio completo
 * GET  /restaurants/:restaurantId/reviews → avaliações do restaurante
 * GET  /categories                       → categorias globais (culinária)
 */

const { Router } = require('express');
const { optionalJWT } = require('../../middlewares/auth.v1.middleware');
const publicController = require('../../controllers/v1/public.controller');

const router = Router();

// optionalJWT em todas as rotas públicas (não bloqueia, mas popula req.user se logado)
router.use(optionalJWT);

/**
 * GET /api/v1/public/tenant/current
 * Resolve o tenant atual com base no subdomínio/host.
 *
 * Query params opcionais (dev/local):
 *   ?tenant=restaurante-do-joao
 */
router.get('/tenant/current', publicController.getCurrentTenant);

/**
 * GET /api/v1/public/restaurants
 * Lista restaurantes ativos com suporte a filtros e paginação.
 *
 * Query params:
 *   ?page=1&per_page=20&sort=trade_name&order=asc
 *   ?city=São Paulo&neighborhood=Pinheiros
 *   ?is_open=true
 */
router.get('/restaurants', publicController.listRestaurants);

/**
 * GET /api/v1/public/restaurants/search
 * Busca full-text por nome do restaurante ou produto.
 *
 * Query params:
 *   ?q=hamburguer&city=SP
 */
router.get('/restaurants/search', publicController.searchRestaurants);

/**
 * GET /api/v1/public/restaurants/:restaurantId
 * Detalhe de um restaurante: perfil + endereço + horários + avaliação média.
 */
router.get('/restaurants/:restaurantId', publicController.getRestaurant);

/**
 * GET /api/v1/public/restaurants/:restaurantId/menu
 * Cardápio completo: categorias → produtos → adicionais → combos.
 */
router.get('/restaurants/:restaurantId/menu', publicController.getRestaurantMenu);

/**
 * GET /api/v1/public/restaurants/:restaurantId/reviews
 * Avaliações visíveis do restaurante, paginadas.
 *
 * Query params:
 *   ?page=1&per_page=10&rating=5
 */
router.get('/restaurants/:restaurantId/reviews', publicController.getRestaurantReviews);

module.exports = router;
