'use strict';

const { db } = require('../../../config/database');
const { ok, created, noContent } = require('../../../shared/response');
const { parsePagination, applyPagination, buildPaginationMeta } = require('../../../shared/pagination');
const { NotFoundError } = require('../../../errors/AppError');

async function list(req, res, next) {
  try {
    const { page, perPage } = parsePagination(req);

    const [{ total }, items] = await Promise.all([
      db('combos').where({ restaurant_id: req.restaurant.id }).whereNull('deleted_at').count('id as total').first(),
      applyPagination(
        db('combos')
          .where({ restaurant_id: req.restaurant.id })
          .whereNull('deleted_at')
          .select('id', 'name', 'description', 'combo_price', 'is_active', 'category_id', 'sort_order'),
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
    const combo = await db('combos')
      .where({ id: req.params.comboId, restaurant_id: req.restaurant.id })
      .whereNull('deleted_at')
      .first();

    if (!combo) throw new NotFoundError('Combo não encontrado.');

    const comboItems = await db('combo_items as ci')
      .join('products as p', 'p.id', 'ci.product_id')
      .where({ 'ci.combo_id': combo.id })
      .whereNull('ci.deleted_at')
      .select('ci.id', 'ci.product_id', 'ci.quantity', 'p.name as product_name');

    return ok(res, { data: { ...combo, items: comboItems } });
  } catch (err) {
    return next(err);
  }
}

async function create(req, res, next) {
  try {
    const { items = [], ...comboData } = req.body;
    const [id] = await db('combos').insert({ restaurant_id: req.restaurant.id, ...comboData });

    if (items.length) {
      await db('combo_items').insert(items.map((i) => ({ combo_id: id, product_id: i.product_id, quantity: i.quantity })));
    }

    return created(res, { data: { id }, message: 'Combo criado.' });
  } catch (err) {
    return next(err);
  }
}

async function update(req, res, next) {
  try {
    const { items, ...comboData } = req.body;
    const affected = await db('combos')
      .where({ id: req.params.comboId, restaurant_id: req.restaurant.id })
      .whereNull('deleted_at')
      .update(comboData);

    if (!affected) throw new NotFoundError('Combo não encontrado.');
    return ok(res, { message: 'Combo atualizado.' });
  } catch (err) {
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    const affected = await db('combos')
      .where({ id: req.params.comboId, restaurant_id: req.restaurant.id })
      .whereNull('deleted_at')
      .update({ deleted_at: new Date() });

    if (!affected) throw new NotFoundError('Combo não encontrado.');
    return noContent(res);
  } catch (err) {
    return next(err);
  }
}

async function toggleStatus(req, res, next) {
  try {
    const combo = await db('combos')
      .where({ id: req.params.comboId, restaurant_id: req.restaurant.id })
      .whereNull('deleted_at')
      .select('id', 'is_active')
      .first();

    if (!combo) throw new NotFoundError('Combo não encontrado.');
    await db('combos').where({ id: combo.id }).update({ is_active: !combo.is_active });
    return ok(res, { data: { is_active: !combo.is_active } });
  } catch (err) {
    return next(err);
  }
}

module.exports = { list, get, create, update, remove, toggleStatus };
