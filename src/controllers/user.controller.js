'use strict';

/**
 * Controller de Usuários.
 *
 * Delega toda a lógica de negócio ao userService.
 * Responsabilidade: montar request/response HTTP.
 */

const userService = require('../services/user.service');

// --------------------------------------------------------------------------
// GET /api/users
// --------------------------------------------------------------------------

async function list(req, res, next) {
  try {
    const { page, limit, search } = req.query;
    const result = await userService.list({ page, limit, search });

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
// GET /api/users/:id
// --------------------------------------------------------------------------

async function findById(req, res, next) {
  try {
    const user = await userService.findById(req.params.id);
    return res.json({ success: true, data: user });
  } catch (err) {
    return next(err);
  }
}

// --------------------------------------------------------------------------
// POST /api/users
// --------------------------------------------------------------------------

async function create(req, res, next) {
  try {
    const user = await userService.create(req.body);
    return res.status(201).json({ success: true, data: user });
  } catch (err) {
    return next(err);
  }
}

// --------------------------------------------------------------------------
// PUT /api/users/:id
// --------------------------------------------------------------------------

async function update(req, res, next) {
  try {
    const user = await userService.update(req.params.id, req.body);
    return res.json({ success: true, data: user });
  } catch (err) {
    return next(err);
  }
}

// --------------------------------------------------------------------------
// DELETE /api/users/:id
// --------------------------------------------------------------------------

async function remove(req, res, next) {
  try {
    await userService.remove(req.params.id);
    return res.json({ success: true, data: { message: 'Usuário desativado com sucesso.' } });
  } catch (err) {
    return next(err);
  }
}

module.exports = { list, findById, create, update, remove };
