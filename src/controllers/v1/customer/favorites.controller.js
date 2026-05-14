'use strict';

const { db } = require('../../../config/database');
const { ok, created, noContent } = require('../../../shared/response');
const { ConflictError, NotFoundError, BadRequestError } = require('../../../errors/AppError');

async function list(req, res, next) {
  try {
    const { page = 1, per_page = 20 } = req.query;
    const items = await db('favorites as f')
      .join('restaurants as r', 'r.id', 'f.restaurant_id')
      .where({ 'f.user_id': req.user.id })
      .whereNull('f.deleted_at')
      .where('r.status', 'active')
      .select('f.id', 'f.created_at', 'r.id as restaurant_id', 'r.slug',
        'r.trade_name', 'r.logo_url', 'r.is_open', 'r.avg_preparation_time_min')
      .orderBy('f.created_at', 'desc')
      .limit(Number(per_page))
      .offset((Number(page) - 1) * Number(per_page));

    return ok(res, { data: items });
  } catch (err) {
    return next(err);
  }
}

async function add(req, res, next) {
  try {
    const { restaurant_id } = req.body;
    if (!restaurant_id) throw new BadRequestError('restaurant_id é obrigatório.');

    const restaurant = await db('restaurants')
      .where({ id: restaurant_id, status: 'active' })
      .whereNull('deleted_at')
      .first();
    if (!restaurant) throw new NotFoundError('Restaurante não encontrado.');

    const existing = await db('favorites')
      .where({ user_id: req.user.id, restaurant_id })
      .whereNull('deleted_at')
      .first();
    if (existing) throw new ConflictError('Restaurante já favoritado.');

    const [id] = await db('favorites').insert({ user_id: req.user.id, restaurant_id });

    return created(res, { data: { id }, message: 'Restaurante adicionado aos favoritos.' });
  } catch (err) {
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    const affected = await db('favorites')
      .where({ user_id: req.user.id, restaurant_id: req.params.restaurantId })
      .whereNull('deleted_at')
      .update({ deleted_at: new Date() });

    if (!affected) throw new NotFoundError('Favorito não encontrado.');
    return noContent(res);
  } catch (err) {
    return next(err);
  }
}

module.exports = { list, add, remove };
