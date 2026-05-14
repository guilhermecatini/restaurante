'use strict';

/**
 * Rotas de perfil do cliente — /api/v1/customer/profile
 *
 * GET    /        → busca dados do perfil
 * PUT    /        → atualiza dados do perfil
 * DELETE /        → desativa conta (soft delete)
 */

const { Router } = require('express');
const { validate } = require('../../../middlewares/validate.middleware');
const { UpdateProfileSchema } = require('../../../validations/v1/customer.validation');
const profileController = require('../../../controllers/v1/customer/profile.controller');

const router = Router();

/** GET /api/v1/customer/profile */
router.get('/', profileController.getProfile);

/** PUT /api/v1/customer/profile */
router.put('/', validate(UpdateProfileSchema), profileController.updateProfile);

/** DELETE /api/v1/customer/profile */
router.delete('/', profileController.deactivateAccount);

module.exports = router;
