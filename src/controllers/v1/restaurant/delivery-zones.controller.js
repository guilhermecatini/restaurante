'use strict';

const { db } = require('../../../config/database');
const { ok, created, noContent } = require('../../../shared/response');
const { NotFoundError } = require('../../../errors/AppError');

async function list(req, res, next) {
  try {
    const zones = await db('delivery_zones')
      .where({ restaurant_id: req.restaurant.id })
      .whereNull('deleted_at')
      .select('id', 'name', 'zone_type', 'radius_km', 'delivery_fee', 'min_order_value', 'estimated_time_min', 'is_active');

    return ok(res, { data: zones });
  } catch (err) {
    return next(err);
  }
}

async function create(req, res, next) {
  try {
    const [id] = await db('delivery_zones').insert({
      restaurant_id: req.restaurant.id,
      ...req.body,
    });

    return created(res, { data: { id }, message: 'Zona de entrega criada.' });
  } catch (err) {
    return next(err);
  }
}

async function get(req, res, next) {
  try {
    const zone = await db('delivery_zones')
      .where({ id: req.params.zoneId, restaurant_id: req.restaurant.id })
      .whereNull('deleted_at')
      .first();

    if (!zone) throw new NotFoundError('Zona de entrega não encontrada.');
    return ok(res, { data: zone });
  } catch (err) {
    return next(err);
  }
}

async function update(req, res, next) {
  try {
    const affected = await db('delivery_zones')
      .where({ id: req.params.zoneId, restaurant_id: req.restaurant.id })
      .whereNull('deleted_at')
      .update(req.body);

    if (!affected) throw new NotFoundError('Zona de entrega não encontrada.');
    return ok(res, { message: 'Zona atualizada.' });
  } catch (err) {
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    const affected = await db('delivery_zones')
      .where({ id: req.params.zoneId, restaurant_id: req.restaurant.id })
      .whereNull('deleted_at')
      .update({ deleted_at: new Date() });

    if (!affected) throw new NotFoundError('Zona de entrega não encontrada.');
    return noContent(res);
  } catch (err) {
    return next(err);
  }
}

async function toggleStatus(req, res, next) {
  try {
    const zone = await db('delivery_zones')
      .where({ id: req.params.zoneId, restaurant_id: req.restaurant.id })
      .whereNull('deleted_at')
      .select('id', 'is_active')
      .first();

    if (!zone) throw new NotFoundError('Zona de entrega não encontrada.');
    await db('delivery_zones').where({ id: zone.id }).update({ is_active: !zone.is_active });
    return ok(res, { data: { is_active: !zone.is_active } });
  } catch (err) {
    return next(err);
  }
}

module.exports = { list, create, get, update, remove, toggleStatus };
