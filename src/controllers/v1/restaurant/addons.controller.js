'use strict';

const { db } = require('../../../config/database');
const { ok, created, noContent } = require('../../../shared/response');
const { NotFoundError, BadRequestError } = require('../../../errors/AppError');

// ---- Addon Groups ----

async function listGroups(req, res, next) {
  try {
    const groups = await db('addon_groups')
      .where({ restaurant_id: req.restaurant.id })
      .whereNull('deleted_at')
      .orderBy('sort_order')
      .select('id', 'name', 'min_select', 'max_select', 'is_required', 'is_active', 'sort_order');

    return ok(res, { data: groups });
  } catch (err) {
    return next(err);
  }
}

async function createGroup(req, res, next) {
  try {
    const [id] = await db('addon_groups').insert({
      restaurant_id: req.restaurant.id,
      ...req.body,
    });

    return created(res, { data: { id }, message: 'Grupo de adicional criado.' });
  } catch (err) {
    return next(err);
  }
}

async function updateGroup(req, res, next) {
  try {
    const affected = await db('addon_groups')
      .where({ id: req.params.groupId, restaurant_id: req.restaurant.id })
      .whereNull('deleted_at')
      .update(req.body);

    if (!affected) throw new NotFoundError('Grupo de adicional não encontrado.');
    return ok(res, { message: 'Grupo atualizado.' });
  } catch (err) {
    return next(err);
  }
}

async function removeGroup(req, res, next) {
  try {
    const affected = await db('addon_groups')
      .where({ id: req.params.groupId, restaurant_id: req.restaurant.id })
      .whereNull('deleted_at')
      .update({ deleted_at: new Date() });

    if (!affected) throw new NotFoundError('Grupo de adicional não encontrado.');
    return noContent(res);
  } catch (err) {
    return next(err);
  }
}

// ---- Addon Items ----

async function listItems(req, res, next) {
  try {
    const group = await db('addon_groups')
      .where({ id: req.params.groupId, restaurant_id: req.restaurant.id })
      .whereNull('deleted_at')
      .first();

    if (!group) throw new NotFoundError('Grupo de adicional não encontrado.');

    const items = await db('addons')
      .where({ addon_group_id: group.id })
      .whereNull('deleted_at')
      .orderBy('sort_order')
      .select('id', 'name', 'description', 'price_delta', 'is_active', 'sort_order');

    return ok(res, { data: items });
  } catch (err) {
    return next(err);
  }
}

async function createItem(req, res, next) {
  try {
    const group = await db('addon_groups')
      .where({ id: req.params.groupId, restaurant_id: req.restaurant.id })
      .whereNull('deleted_at')
      .first();

    if (!group) throw new NotFoundError('Grupo de adicional não encontrado.');

    const [id] = await db('addons').insert({
      addon_group_id: group.id,
      ...req.body,
    });

    return created(res, { data: { id }, message: 'Adicional criado.' });
  } catch (err) {
    return next(err);
  }
}

async function updateItem(req, res, next) {
  try {
    const affected = await db('addons')
      .where({ id: req.params.addonId, addon_group_id: req.params.groupId })
      .whereNull('deleted_at')
      .update(req.body);

    if (!affected) throw new NotFoundError('Adicional não encontrado.');
    return ok(res, { message: 'Adicional atualizado.' });
  } catch (err) {
    return next(err);
  }
}

async function removeItem(req, res, next) {
  try {
    const affected = await db('addons')
      .where({ id: req.params.addonId, addon_group_id: req.params.groupId })
      .whereNull('deleted_at')
      .update({ deleted_at: new Date() });

    if (!affected) throw new NotFoundError('Adicional não encontrado.');
    return noContent(res);
  } catch (err) {
    return next(err);
  }
}

module.exports = { listGroups, createGroup, updateGroup, removeGroup, listItems, createItem, updateItem, removeItem };
