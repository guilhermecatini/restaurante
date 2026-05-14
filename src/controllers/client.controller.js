'use strict';

/**
 * Controller de Clientes.
 */

const clientService = require('../services/client.service');

// --------------------------------------------------------------------------
// GET /api/clients
// --------------------------------------------------------------------------

async function list(req, res, next) {
  try {
    const { page, limit, status, marketSegment, search } = req.query;
    const result = await clientService.list({ page, limit, status, marketSegment, search });

    return res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (err) {
    return next(err);
  }
}

// --------------------------------------------------------------------------
// GET /api/clients/:id
// --------------------------------------------------------------------------

async function findById(req, res, next) {
  try {
    const client = await clientService.findById(req.params.id);
    return res.json({ success: true, data: client });
  } catch (err) {
    return next(err);
  }
}

// --------------------------------------------------------------------------
// POST /api/clients
// --------------------------------------------------------------------------

async function create(req, res, next) {
  try {
    // req.user é preenchido pelo middleware authenticateJWT
    const client = await clientService.create(req.body, req.user?.id);
    return res.status(201).json({ success: true, data: client });
  } catch (err) {
    return next(err);
  }
}

// --------------------------------------------------------------------------
// PUT /api/clients/:id
// --------------------------------------------------------------------------

async function update(req, res, next) {
  try {
    const client = await clientService.update(req.params.id, req.body);
    return res.json({ success: true, data: client });
  } catch (err) {
    return next(err);
  }
}

// --------------------------------------------------------------------------
// DELETE /api/clients/:id
// --------------------------------------------------------------------------

async function remove(req, res, next) {
  try {
    await clientService.remove(req.params.id);
    return res.json({ success: true, data: { message: 'Cliente desativado com sucesso.' } });
  } catch (err) {
    return next(err);
  }
}

module.exports = { list, findById, create, update, remove };
