'use strict';

const { db } = require('../../../config/database');
const { ok, noContent } = require('../../../shared/response');
const { ConflictError } = require('../../../errors/AppError');

async function get(req, res) {
  return ok(res, { data: req.restaurant });
}

async function update(req, res, next) {
  try {
    if (req.body.subdomain) {
      const normalizedSubdomain = String(req.body.subdomain).toLowerCase().trim();
      const existing = await db('restaurants')
        .where({ subdomain: normalizedSubdomain })
        .whereNot({ id: req.restaurant.id })
        .whereNull('deleted_at')
        .first();

      if (existing) throw new ConflictError('Subdomínio já utilizado.');
      req.body.subdomain = normalizedSubdomain;
    }

    await db('restaurants')
      .where({ id: req.restaurant.id })
      .update(req.body);

    const updated = await db('restaurants').where({ id: req.restaurant.id }).first();
    return ok(res, { data: updated, message: 'Perfil atualizado.' });
  } catch (err) {
    return next(err);
  }
}

async function toggleStatus(req, res, next) {
  try {
    const newStatus = !req.restaurant.is_open;
    await db('restaurants').where({ id: req.restaurant.id }).update({ is_open: newStatus });
    return ok(res, {
      data: {
        isOpen: newStatus,
        // Compatibilidade retroativa
        is_open: newStatus,
      },
      message: newStatus ? 'Restaurante aberto.' : 'Restaurante fechado.',
    });
  } catch (err) {
    return next(err);
  }
}

async function deactivate(req, res, next) {
  try {
    await db('restaurants').where({ id: req.restaurant.id }).update({
      status: 'inactive',
      deleted_at: new Date(),
    });
    return noContent(res);
  } catch (err) {
    return next(err);
  }
}

module.exports = { get, update, toggleStatus, deactivate };
