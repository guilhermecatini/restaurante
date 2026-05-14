'use strict';

/**
 * Rotas de endereços do cliente — /api/v1/customer/addresses
 *
 * GET    /            → lista todos os endereços ativos
 * POST   /            → cadastra novo endereço
 * GET    /:addressId  → detalhe de um endereço
 * PUT    /:addressId  → atualiza endereço
 * DELETE /:addressId  → remove endereço (soft delete)
 * PATCH  /:addressId/default → marca como endereço padrão
 */

const { Router } = require('express');
const { validate } = require('../../../middlewares/validate.middleware');
const {
  AddressSchema,
  UpdateAddressSchema,
} = require('../../../validations/v1/customer.validation');
const addressController = require('../../../controllers/v1/customer/addresses.controller');

const router = Router();

/** GET /api/v1/customer/addresses */
router.get('/', addressController.list);

/** POST /api/v1/customer/addresses */
router.post('/', validate(AddressSchema), addressController.create);

/** GET /api/v1/customer/addresses/:addressId */
router.get('/:addressId', addressController.get);

/** PUT /api/v1/customer/addresses/:addressId */
router.put('/:addressId', validate(UpdateAddressSchema), addressController.update);

/** DELETE /api/v1/customer/addresses/:addressId */
router.delete('/:addressId', addressController.remove);

/** PATCH /api/v1/customer/addresses/:addressId/default */
router.patch('/:addressId/default', addressController.setDefault);

module.exports = router;
