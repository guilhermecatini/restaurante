'use strict';

const { db } = require('../../../config/database');
const { ok, created, noContent } = require('../../../shared/response');
const { NotFoundError } = require('../../../errors/AppError');

function assertBelongsToRestaurant(row) {
  if (!row) throw new NotFoundError('Categoria não encontrada.');
}

async function list(req, res, next) {
  try {
    const categories = await db('categories')
      .where({ restaurant_id: req.restaurant.id })
      .whereNull('deleted_at')
      .orderBy('sort_order')
      .select('id', 'name', 'slug', 'sort_order', 'is_active', 'created_at');

    return ok(res, { data: categories });
  } catch (err) {
    return next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name, slug, sort_order, is_active } = req.body;
    const generatedSlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const [id] = await db('categories').insert({
      restaurant_id: req.restaurant.id,
      name,
      slug: generatedSlug,
      sort_order: sort_order || 0,
      is_active: is_active !== false,
    });

    return created(res, { data: { id, slug: generatedSlug }, message: 'Categoria criada.' });
  } catch (err) {
    return next(err);
  }
}

async function update(req, res, next) {
  try {
    const row = await db('categories')
      .where({ id: req.params.categoryId, restaurant_id: req.restaurant.id })
      .whereNull('deleted_at')
      .first();

    assertBelongsToRestaurant(row);

    await db('categories').where({ id: row.id }).update(req.body);
    return ok(res, { message: 'Categoria atualizada.' });
  } catch (err) {
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    const affected = await db('categories')
      .where({ id: req.params.categoryId, restaurant_id: req.restaurant.id })
      .whereNull('deleted_at')
      .update({ deleted_at: new Date() });

    if (!affected) throw new NotFoundError('Categoria não encontrada.');
    return noContent(res);
  } catch (err) {
    return next(err);
  }
}

async function reorder(req, res, next) {
  try {
    const { items } = req.body; // [{ id, sort_order }]
    await Promise.all(
      (items || []).map((item) =>
        db('categories')
          .where({ id: item.id, restaurant_id: req.restaurant.id })
          .update({ sort_order: item.sort_order })
      )
    );
    return ok(res, { message: 'Ordem atualizada.' });
  } catch (err) {
    return next(err);
  }
}

module.exports = { list, create, update, remove, reorder };
