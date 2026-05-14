'use strict';

const { db } = require('../../../config/database');
const { ok, noContent } = require('../../../shared/response');

async function getProfile(req, res, next) {
  try {
    const user = await db('users')
      .where({ id: req.user.id })
      .whereNull('deleted_at')
      .select('id', 'first_name', 'last_name', 'email', 'phone', 'birth_date', 'status', 'created_at')
      .first();

    return ok(res, { data: user });
  } catch (err) {
    return next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { first_name, last_name, phone, birth_date } = req.body;

    await db('users').where({ id: req.user.id }).update({
      ...(first_name && { first_name }),
      ...(last_name && { last_name }),
      ...(phone !== undefined && { phone }),
      ...(birth_date !== undefined && { birth_date }),
    });

    const updated = await db('users')
      .where({ id: req.user.id })
      .select('id', 'first_name', 'last_name', 'email', 'phone', 'birth_date')
      .first();

    return ok(res, { data: updated, message: 'Perfil atualizado.' });
  } catch (err) {
    return next(err);
  }
}

async function deactivateAccount(req, res, next) {
  try {
    await db('users').where({ id: req.user.id }).update({
      status: 'inactive',
      deleted_at: new Date(),
    });

    return noContent(res);
  } catch (err) {
    return next(err);
  }
}

module.exports = { getProfile, updateProfile, deactivateAccount };
