'use strict';

/**
 * RBAC — Role-Based Access Control.
 *
 * Hierarquia de roles do sistema:
 *
 *   super_admin         → acesso total à plataforma
 *   restaurant_owner    → dono do restaurante, acesso total ao backoffice do seu restaurante
 *   restaurant_manager  → gerente, pode tudo exceto deletar o restaurante ou mudar owner
 *   restaurant_operator → atendente/cozinha, acesso operacional (pedidos, cardápio)
 *   customer            → cliente final, acesso à área de cliente
 *
 * Uso:
 *   router.get('/rota', authenticateJWT, requireRole('customer'), controller.fn);
 *   router.post('/rota', authenticateJWT, requireAnyRole(['restaurant_owner', 'restaurant_manager']), controller.fn);
 */

const { ForbiddenError } = require('../errors/AppError');

// Ordem de precedência — índice maior = mais privilegiado
const ROLE_HIERARCHY = {
  customer: 0,
  restaurant_operator: 1,
  restaurant_manager: 2,
  restaurant_owner: 3,
  super_admin: 99,
};

/**
 * Retorna middleware que exige exatamente um dos roles listados.
 * super_admin sempre passa.
 *
 * @param {string[]} roles - Lista de roles permitidos
 */
function requireAnyRole(roles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new ForbiddenError());
    }

    const userRole = req.user.user_type;

    // super_admin sempre autorizado
    if (userRole === 'super_admin') return next();

    if (roles.includes(userRole)) return next();

    return next(
      new ForbiddenError(
        `Acesso negado. Roles permitidos: ${roles.join(', ')}. Seu role: ${userRole}.`
      )
    );
  };
}

/**
 * Atalho para exigir um único role.
 *
 * @param {string} role
 */
function requireRole(role) {
  return requireAnyRole([role]);
}

/**
 * Exige que o role do usuário seja >= ao role mínimo informado (hierarquia).
 * Útil para "restaurant_manager ou acima".
 *
 * @param {string} minRole
 */
function requireMinRole(minRole) {
  return (req, _res, next) => {
    if (!req.user) return next(new ForbiddenError());

    const userLevel = ROLE_HIERARCHY[req.user.user_type] ?? -1;
    const minLevel = ROLE_HIERARCHY[minRole] ?? 0;

    if (userLevel >= minLevel) return next();

    return next(
      new ForbiddenError(`Acesso negado. Role mínimo requerido: ${minRole}.`)
    );
  };
}

/**
 * Roles de backoffice do restaurante.
 * Atalho para proteger qualquer rota do painel do restaurante.
 */
const requireRestaurantAccess = requireAnyRole([
  'restaurant_owner',
  'restaurant_manager',
  'restaurant_operator',
  'super_admin',
]);

/**
 * Apenas owner ou manager do restaurante.
 */
const requireRestaurantManager = requireAnyRole([
  'restaurant_owner',
  'restaurant_manager',
  'super_admin',
]);

/**
 * Apenas owner do restaurante.
 */
const requireRestaurantOwner = requireAnyRole(['restaurant_owner', 'super_admin']);

/**
 * Apenas cliente final.
 */
const requireCustomer = requireRole('customer');

module.exports = {
  requireRole,
  requireAnyRole,
  requireMinRole,
  requireRestaurantAccess,
  requireRestaurantManager,
  requireRestaurantOwner,
  requireCustomer,
  ROLE_HIERARCHY,
};
