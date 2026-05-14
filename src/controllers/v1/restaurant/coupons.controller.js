'use strict';

const { db } = require('../../../config/database');
const { ok, created, noContent } = require('../../../shared/response');
const { parsePagination, applyPagination, buildPaginationMeta } = require('../../../shared/pagination');
const { NotFoundError } = require('../../../errors/AppError');

async function list(req, res, next) {
  try {
    const { page, perPage } = parsePagination(req);

    const [{ total }, items] = await Promise.all([
      db('coupons').where({ restaurant_id: req.restaurant.id }).whereNull('deleted_at').count('id as total').first(),
      applyPagination(
        db('coupons')
          .where({ restaurant_id: req.restaurant.id })
          .whereNull('deleted_at')
          .select('id', 'code', 'discount_type', 'discount_value', 'is_active', 'starts_at', 'ends_at', 'used_count', 'usage_limit_total'),
        { page, perPage }
      ),
    ]);

    return ok(res, { data: items, meta: { pagination: buildPaginationMeta(Number(total), page, perPage) } });
  } catch (err) {
    return next(err);
  }
}

async function get(req, res, next) {
  try {
    const coupon = await db('coupons')
      .where({ id: req.params.couponId, restaurant_id: req.restaurant.id })
      .whereNull('deleted_at')
      .first();

    if (!coupon) throw new NotFoundError('Cupom não encontrado.');
    return ok(res, { data: coupon });
  } catch (err) {
    return next(err);
  }
}

async function create(req, res, next) {
  try {
    const { code, ...rest } = req.body;
    const [id] = await db('coupons').insert({
      restaurant_id: req.restaurant.id,
      code: code.toUpperCase(),
      ...rest,
    });

    return created(res, { data: { id }, message: 'Cupom criado.' });
  } catch (err) {
    return next(err);
  }
}

async function update(req, res, next) {
  try {
    const affected = await db('coupons')
      .where({ id: req.params.couponId, restaurant_id: req.restaurant.id })
      .whereNull('deleted_at')
      .update(req.body);

    if (!affected) throw new NotFoundError('Cupom não encontrado.');
    return ok(res, { message: 'Cupom atualizado.' });
  } catch (err) {
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    const affected = await db('coupons')
      .where({ id: req.params.couponId, restaurant_id: req.restaurant.id })
      .whereNull('deleted_at')
      .update({ deleted_at: new Date() });

    if (!affected) throw new NotFoundError('Cupom não encontrado.');
    return noContent(res);
  } catch (err) {
    return next(err);
  }
}

async function toggleStatus(req, res, next) {
  try {
    const coupon = await db('coupons')
      .where({ id: req.params.couponId, restaurant_id: req.restaurant.id })
      .whereNull('deleted_at')
      .select('id', 'is_active')
      .first();

    if (!coupon) throw new NotFoundError('Cupom não encontrado.');
    await db('coupons').where({ id: coupon.id }).update({ is_active: !coupon.is_active });
    return ok(res, { data: { is_active: !coupon.is_active } });
  } catch (err) {
    return next(err);
  }
}

async function listRedemptions(req, res, next) {
  try {
    const { page, perPage } = parsePagination(req);

    const query = db('coupon_redemptions as cr')
      .join('orders as o', 'o.id', 'cr.order_id')
      .join('users as u', 'u.id', 'cr.user_id')
      .where({ 'cr.coupon_id': req.params.couponId })
      .whereNull('cr.deleted_at');

    const [{ total }, items] = await Promise.all([
      query.clone().count('cr.id as total').first(),
      applyPagination(
        query.clone()
          .select('cr.id', 'cr.discount_amount', 'cr.created_at',
            'o.order_number', 'u.first_name', 'u.last_name', 'u.email'),
        { page, perPage }
      ),
    ]);

    return ok(res, { data: items, meta: { pagination: buildPaginationMeta(Number(total), page, perPage) } });
  } catch (err) {
    return next(err);
  }
}

module.exports = { list, get, create, update, remove, toggleStatus, listRedemptions };
