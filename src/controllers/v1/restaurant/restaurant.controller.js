'use strict';

const { db } = require('../../../config/database');
const { ok, created } = require('../../../shared/response');
const { ConflictError } = require('../../../errors/AppError');
const { parsePagination, applyPagination, buildPaginationMeta } = require('../../../shared/pagination');

async function listMine(req, res, next) {
  try {
    const restaurants = await db('restaurant_users as ru')
      .join('restaurants as r', 'r.id', 'ru.restaurant_id')
      .where({ 'ru.user_id': req.user.id, 'ru.is_active': true })
      .whereNull('ru.deleted_at')
      .whereNull('r.deleted_at')
      .select('r.id', 'r.slug', 'r.subdomain', 'r.trade_name', 'r.logo_url', 'r.status', 'r.is_open', 'ru.role')
      .orderBy('r.trade_name');

    return ok(res, { data: restaurants });
  } catch (err) {
    return next(err);
  }
}

async function create(req, res, next) {
  try {
    const { slug, subdomain, legal_name, trade_name, document_number, ...rest } = req.body;
    const normalizedSubdomain = (subdomain || slug).toLowerCase().trim();

    const existing = await db('restaurants').where({ slug }).whereNull('deleted_at').first();
    if (existing) throw new ConflictError('Slug já utilizado.');

    const existingSubdomain = await db('restaurants').where({ subdomain: normalizedSubdomain }).whereNull('deleted_at').first();
    if (existingSubdomain) throw new ConflictError('Subdomínio já utilizado.');

    const [restaurantId] = await db('restaurants').insert({
      slug,
      subdomain: normalizedSubdomain,
      legal_name,
      trade_name,
      document_number: document_number || null,
      ...rest,
      status: 'pending_approval',
    });

    await db('restaurant_users').insert({
      restaurant_id: restaurantId,
      user_id: req.user.id,
      role: 'owner',
      is_active: true,
    });

    return created(res, { data: { id: restaurantId, slug, subdomain: normalizedSubdomain }, message: 'Restaurante criado.' });
  } catch (err) {
    return next(err);
  }
}

module.exports = { listMine, create };
