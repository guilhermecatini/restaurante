'use strict';

const { db } = require('../../../config/database');
const { ok, created, noContent } = require('../../../shared/response');
const { parsePagination, applyPagination, buildPaginationMeta } = require('../../../shared/pagination');
const { NotFoundError } = require('../../../errors/AppError');

async function list(req, res, next) {
  try {
    const { page, perPage } = parsePagination(req);
    const { status } = req.query;

    const query = db('orders as o')
      .join('users as u', 'u.id', 'o.customer_user_id')
      .where({ 'o.restaurant_id': req.restaurant.id })
      .whereNull('o.deleted_at');

    if (status) query.where('o.status', status);

    const [{ total }, items] = await Promise.all([
      query.clone().count('o.id as total').first(),
      applyPagination(
        query.clone()
          .select('o.id', 'o.order_number', 'o.status', 'o.payment_status',
            'o.total_amount', 'o.order_type', 'o.placed_at',
            'u.first_name', 'u.last_name', 'u.phone')
          .orderBy('o.placed_at', 'desc'),
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
    const items = await db('order_items').where({ order_id: req.order.id }).whereNull('deleted_at')
      .select('id', 'item_name_snapshot', 'quantity', 'unit_price', 'total_price', 'customer_notes');

    return ok(res, { data: { ...req.order, items } });
  } catch (err) {
    return next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const { status, notes } = req.body;

    const timestampField = {
      confirmed: 'confirmed_at',
      preparing: null,
      ready_for_pickup: 'prepared_at',
      out_for_delivery: 'dispatched_at',
      delivered: 'delivered_at',
      canceled: 'canceled_at',
    }[status];

    await db('orders').where({ id: req.order.id }).update({
      status,
      ...(timestampField && { [timestampField]: new Date() }),
      ...(notes && status === 'canceled' && { cancellation_reason: notes }),
      ...(status !== 'canceled' && notes && { restaurant_notes: notes }),
    });

    return ok(res, { data: { status }, message: 'Status atualizado.' });
  } catch (err) {
    return next(err);
  }
}

async function listItems(req, res, next) {
  try {
    const items = await db('order_items as oi')
      .where({ 'oi.order_id': req.order.id })
      .whereNull('oi.deleted_at')
      .select('oi.id', 'oi.item_name_snapshot', 'oi.quantity', 'oi.unit_price', 'oi.total_price', 'oi.customer_notes');

    const itemIds = items.map((i) => i.id);
    const addons = itemIds.length
      ? await db('order_item_addons').whereIn('order_item_id', itemIds).whereNull('deleted_at')
          .select('order_item_id', 'addon_name_snapshot', 'quantity', 'unit_price')
      : [];

    return ok(res, {
      data: items.map((i) => ({
        ...i,
        addons: addons.filter((a) => a.order_item_id === i.id),
      })),
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { list, get, updateStatus, listItems };
