'use strict';

const { db } = require('../../../config/database');
const { ok, created, noContent } = require('../../../shared/response');
const { NotFoundError, ConflictError, BadRequestError } = require('../../../errors/AppError');

const ALLOWED_ROLES = ['owner', 'manager', 'attendant', 'kitchen', 'courier', 'finance'];

async function list(req, res, next) {
  try {
    const members = await db('restaurant_users as ru')
      .join('users as u', 'u.id', 'ru.user_id')
      .where({ 'ru.restaurant_id': req.restaurant.id, 'ru.is_active': true })
      .whereNull('ru.deleted_at')
      .select('ru.id', 'ru.role', 'ru.created_at', 'u.id as user_id', 'u.first_name', 'u.last_name', 'u.email');

    return ok(res, { data: members });
  } catch (err) {
    return next(err);
  }
}

async function invite(req, res, next) {
  try {
    const { email, role } = req.body;

    if (!ALLOWED_ROLES.includes(role)) {
      throw new BadRequestError(`Role inválida. Permitidas: ${ALLOWED_ROLES.join(', ')}`);
    }

    const user = await db('users').where({ email }).whereNull('deleted_at').first();
    if (!user) throw new NotFoundError('Usuário não encontrado. O e-mail precisa estar cadastrado.');

    const existing = await db('restaurant_users')
      .where({ restaurant_id: req.restaurant.id, user_id: user.id, is_active: true })
      .whereNull('deleted_at')
      .first();

    if (existing) throw new ConflictError('Usuário já faz parte da equipe.');

    const [id] = await db('restaurant_users').insert({
      restaurant_id: req.restaurant.id,
      user_id: user.id,
      role,
      is_active: true,
    });

    return created(res, { data: { id }, message: `${user.first_name} adicionado(a) à equipe como ${role}.` });
  } catch (err) {
    return next(err);
  }
}

async function get(req, res, next) {
  try {
    const member = await db('restaurant_users as ru')
      .join('users as u', 'u.id', 'ru.user_id')
      .where({ 'ru.id': req.params.memberId, 'ru.restaurant_id': req.restaurant.id })
      .whereNull('ru.deleted_at')
      .select('ru.id', 'ru.role', 'ru.is_active', 'ru.created_at',
        'u.id as user_id', 'u.first_name', 'u.last_name', 'u.email')
      .first();

    if (!member) throw new NotFoundError('Membro não encontrado.');
    return ok(res, { data: member });
  } catch (err) {
    return next(err);
  }
}

async function updateRole(req, res, next) {
  try {
    const { role } = req.body;

    if (!ALLOWED_ROLES.includes(role)) {
      throw new BadRequestError(`Role inválida. Permitidas: ${ALLOWED_ROLES.join(', ')}`);
    }

    const affected = await db('restaurant_users')
      .where({ id: req.params.memberId, restaurant_id: req.restaurant.id })
      .whereNull('deleted_at')
      .update({ role });

    if (!affected) throw new NotFoundError('Membro não encontrado.');
    return ok(res, { message: 'Papel atualizado.' });
  } catch (err) {
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    const affected = await db('restaurant_users')
      .where({ id: req.params.memberId, restaurant_id: req.restaurant.id })
      .whereNull('deleted_at')
      .update({ is_active: false, deleted_at: new Date() });

    if (!affected) throw new NotFoundError('Membro não encontrado.');
    return noContent(res);
  } catch (err) {
    return next(err);
  }
}

module.exports = { list, invite, get, updateRole, remove };
