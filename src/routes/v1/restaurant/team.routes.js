'use strict';

/**
 * Equipe do restaurante — /api/v1/restaurant/:restaurantId/team
 *
 * GET    /                 → lista membros da equipe
 * POST   /                 → convida novo membro (por e-mail)
 * GET    /:memberId        → detalhe do membro
 * PATCH  /:memberId/role   → altera role do membro
 * DELETE /:memberId        → remove membro (soft delete)
 */

const { Router } = require('express');
const { validate } = require('../../../middlewares/validate.middleware');
const {
  InviteTeamMemberSchema,
  UpdateTeamMemberRoleSchema,
} = require('../../../validations/v1/restaurant.validation');
const {
  requireRestaurantOwner,
  requireRestaurantManager,
} = require('../../../middlewares/rbac.middleware');
const teamController = require('../../../controllers/v1/restaurant/team.controller');

const router = Router({ mergeParams: true });

router.get('/', teamController.list);
router.post('/', requireRestaurantManager, validate(InviteTeamMemberSchema), teamController.invite);
router.get('/:memberId', teamController.get);
router.patch('/:memberId/role', requireRestaurantOwner, validate(UpdateTeamMemberRoleSchema), teamController.updateRole);
router.delete('/:memberId', requireRestaurantOwner, teamController.remove);

module.exports = router;
