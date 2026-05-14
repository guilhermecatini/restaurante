'use strict';

const { db } = require('../../../config/database');
const { ok } = require('../../../shared/response');

async function summary(req, res, next) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [ordersToday, pendingOrders, revenue] = await Promise.all([
      db('orders')
        .where({ restaurant_id: req.restaurant.id })
        .whereNot({ status: 'canceled' })
        .where('placed_at', '>=', today)
        .whereNull('deleted_at')
        .count('id as total')
        .first(),

      db('orders')
        .where({ restaurant_id: req.restaurant.id })
        .whereIn('status', ['placed', 'confirmed', 'preparing'])
        .whereNull('deleted_at')
        .count('id as total')
        .first(),

      db('orders')
        .where({ restaurant_id: req.restaurant.id, payment_status: 'paid' })
        .where('placed_at', '>=', today)
        .whereNull('deleted_at')
        .sum('total_amount as total')
        .first(),
    ]);

    return ok(res, {
      data: {
        orders_today: Number(ordersToday?.total) || 0,
        pending_orders: Number(pendingOrders?.total) || 0,
        revenue_today: parseFloat(revenue?.total || 0).toFixed(2),
        is_open: req.restaurant.is_open,
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function ordersStats(req, res, next) {
  try {
    const { from, to } = req.query;
    const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const toDate = to ? new Date(to) : new Date();

    const stats = await db('orders')
      .where({ restaurant_id: req.restaurant.id })
      .whereBetween('placed_at', [fromDate, toDate])
      .whereNull('deleted_at')
      .groupBy('status')
      .select('status')
      .count('id as total');

    return ok(res, { data: stats });
  } catch (err) {
    return next(err);
  }
}

async function revenue(req, res, next) {
  try {
    const { from, to } = req.query;
    const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const toDate = to ? new Date(to) : new Date();

    const result = await db('orders')
      .where({ restaurant_id: req.restaurant.id, payment_status: 'paid' })
      .whereBetween('placed_at', [fromDate, toDate])
      .whereNull('deleted_at')
      .sum('total_amount as total')
      .count('id as orders')
      .first();

    return ok(res, {
      data: {
        total_revenue: parseFloat(result?.total || 0).toFixed(2),
        total_orders: Number(result?.orders) || 0,
        period: { from: fromDate, to: toDate },
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function topProducts(req, res, next) {
  try {
    const products = await db('order_items as oi')
      .join('orders as o', 'o.id', 'oi.order_id')
      .where({ 'o.restaurant_id': req.restaurant.id })
      .whereNotIn('o.status', ['canceled'])
      .whereNull('o.deleted_at')
      .whereNull('oi.deleted_at')
      .groupBy('oi.product_id', 'oi.item_name_snapshot')
      .select('oi.product_id', 'oi.item_name_snapshot')
      .sum('oi.quantity as total_sold')
      .orderBy('total_sold', 'desc')
      .limit(10);

    return ok(res, { data: products });
  } catch (err) {
    return next(err);
  }
}

module.exports = { summary, ordersStats, revenue, topProducts };
