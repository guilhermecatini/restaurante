'use strict';

const { db } = require('../../../config/database');
const { ok, created } = require('../../../shared/response');
const { ConflictError, BadRequestError } = require('../../../errors/AppError');

async function listMine(req, res, next) {
  try {
    const reviews = await db('restaurant_reviews as rr')
      .join('restaurants as r', 'r.id', 'rr.restaurant_id')
      .where({ 'rr.user_id': req.user.id })
      .whereNull('rr.deleted_at')
      .select('rr.id', 'rr.rating', 'rr.comment', 'rr.created_at',
        'r.id as restaurant_id', 'r.trade_name', 'r.logo_url')
      .orderBy('rr.created_at', 'desc');

    return ok(res, { data: reviews });
  } catch (err) {
    return next(err);
  }
}

async function reviewRestaurant(req, res, next) {
  try {
    const { order_id, rating, comment } = req.body;

    const order = await db('orders')
      .where({ id: order_id, customer_user_id: req.user.id, status: 'delivered' })
      .whereNull('deleted_at')
      .first();

    if (!order) throw new BadRequestError('Pedido não encontrado ou ainda não entregue.');

    const existing = await db('restaurant_reviews')
      .where({ order_id, user_id: req.user.id })
      .whereNull('deleted_at')
      .first();

    if (existing) throw new ConflictError('Você já avaliou este pedido.');

    const [id] = await db('restaurant_reviews').insert({
      order_id,
      restaurant_id: order.restaurant_id,
      user_id: req.user.id,
      rating,
      comment: comment || null,
    });

    return created(res, { data: { id }, message: 'Avaliação enviada.' });
  } catch (err) {
    return next(err);
  }
}

async function reviewOrder(req, res, next) {
  try {
    const { overall_rating, delivery_rating, packaging_rating, comment } = req.body;
    const order = req.order;

    if (order.status !== 'delivered') throw new BadRequestError('Só é possível avaliar pedidos entregues.');

    const existing = await db('order_reviews')
      .where({ order_id: order.id, user_id: req.user.id })
      .whereNull('deleted_at')
      .first();

    if (existing) throw new ConflictError('Você já avaliou este pedido.');

    const [id] = await db('order_reviews').insert({
      order_id: order.id,
      user_id: req.user.id,
      overall_rating,
      delivery_rating: delivery_rating || null,
      packaging_rating: packaging_rating || null,
      comment: comment || null,
    });

    return created(res, { data: { id }, message: 'Avaliação do pedido enviada.' });
  } catch (err) {
    return next(err);
  }
}

module.exports = { listMine, reviewRestaurant, reviewOrder };
