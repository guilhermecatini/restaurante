'use strict';

/**
 * Middlewares de ownership — garantem que o usuário autenticado
 * só acessa recursos que lhe pertencem ou ao seu restaurante.
 *
 * PROBLEMA QUE RESOLVE:
 *   - Restaurante A não pode ver/alterar dados do Restaurante B
 *   - Cliente X não pode ver pedidos do Cliente Y
 *   - Staff de um restaurante não pode acessar outro restaurante
 *
 * COMO USAR:
 *   router.param('restaurantId', loadRestaurantContext);
 *   router.use(assertRestaurantMembership);
 *
 *   router.param('orderId', loadOrderContext);
 *   router.use(assertOrderOwnership);
 */

const { db } = require('../config/database');
const { ForbiddenError, NotFoundError } = require('../errors/AppError');

// --------------------------------------------------------------------------
// Restaurant context
// --------------------------------------------------------------------------

/**
 * router.param middleware — carrega o restaurante a partir de :restaurantId
 * e popula req.restaurant.
 *
 * Use em routers que trabalham com /restaurants/:restaurantId.
 */
async function loadRestaurantContext(req, _res, next, restaurantId) {
  const restaurant = await db('restaurants')
    .where({ id: restaurantId })
    .whereNull('deleted_at')
    .select('id', 'slug', 'trade_name', 'status')
    .first();

  if (!restaurant) {
    return next(new NotFoundError('Restaurante não encontrado.'));
  }

  req.restaurant = restaurant;
  return next();
}

/**
 * Garante que o usuário autenticado é membro do restaurante em req.restaurant.
 * super_admin passa incondicionalmente.
 */
async function assertRestaurantMembership(req, _res, next) {
  if (!req.user || !req.restaurant) return next(new ForbiddenError());

  if (req.user.user_type === 'super_admin') return next();

  const membership = await db('restaurant_users')
    .where({
      restaurant_id: req.restaurant.id,
      user_id: req.user.id,
      is_active: true,
    })
    .whereNull('deleted_at')
    .select('id', 'role')
    .first();

  if (!membership) {
    return next(new ForbiddenError('Você não tem acesso a este restaurante.'));
  }

  // Expõe o role específico do usuário neste restaurante
  req.restaurantRole = membership.role;
  return next();
}

// --------------------------------------------------------------------------
// Customer order ownership
// --------------------------------------------------------------------------

/**
 * router.param — carrega pedido por :orderId e popula req.order.
 * Valida que o pedido existe e não está soft-deleted.
 */
async function loadOrderContext(req, _res, next, orderId) {
  const order = await db('orders')
    .where({ id: orderId })
    .whereNull('deleted_at')
    .select('id', 'customer_user_id', 'restaurant_id', 'status', 'payment_status', 'order_number')
    .first();

  if (!order) {
    return next(new NotFoundError('Pedido não encontrado.'));
  }

  req.order = order;
  return next();
}

/**
 * Garante que o pedido em req.order pertence ao cliente autenticado.
 * super_admin passa.
 */
function assertCustomerOrderOwnership(req, _res, next) {
  if (!req.user || !req.order) return next(new ForbiddenError());
  if (req.user.user_type === 'super_admin') return next();

  if (req.order.customer_user_id !== req.user.id) {
    return next(new ForbiddenError('Você não tem acesso a este pedido.'));
  }

  return next();
}

/**
 * Garante que o pedido em req.order pertence ao restaurante em req.restaurant.
 */
function assertRestaurantOrderOwnership(req, _res, next) {
  if (!req.user || !req.order || !req.restaurant) return next(new ForbiddenError());
  if (req.user.user_type === 'super_admin') return next();

  if (req.order.restaurant_id !== req.restaurant.id) {
    return next(new ForbiddenError('Este pedido não pertence ao seu restaurante.'));
  }

  return next();
}

// --------------------------------------------------------------------------
// Customer data ownership
// --------------------------------------------------------------------------

/**
 * Garante que o :userId do param é o mesmo usuário autenticado.
 * Evita que cliente A acesse dados do cliente B.
 */
function assertSelfOwnership(req, _res, next) {
  if (!req.user) return next(new ForbiddenError());
  if (req.user.user_type === 'super_admin') return next();

  const paramId = parseInt(req.params.userId, 10);
  if (req.user.id !== paramId) {
    return next(new ForbiddenError('Você só pode acessar seus próprios dados.'));
  }

  return next();
}

module.exports = {
  loadRestaurantContext,
  assertRestaurantMembership,
  loadOrderContext,
  assertCustomerOrderOwnership,
  assertRestaurantOrderOwnership,
  assertSelfOwnership,
};
