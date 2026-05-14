'use strict';

const { db } = require('../../../config/database');
const { ok, created, noContent } = require('../../../shared/response');
const { parsePagination, applyPagination, buildPaginationMeta } = require('../../../shared/pagination');
const { NotFoundError, BadRequestError } = require('../../../errors/AppError');

function assertOwnership(row) {
  if (!row) throw new NotFoundError('Produto não encontrado.');
}

async function list(req, res, next) {
  try {
    const { page, perPage } = parsePagination(req, { defaultSort: 'sort_order', allowedSorts: ['sort_order', 'name', 'base_price', 'created_at'] });
    const { category_id, is_active } = req.query;

    const query = db('products')
      .where({ restaurant_id: req.restaurant.id })
      .whereNull('deleted_at');

    if (category_id) query.where({ category_id });
    if (is_active !== undefined) query.where({ is_active: is_active === 'true' });

    const [{ total }, items] = await Promise.all([
      query.clone().count('id as total').first(),
      applyPagination(query.clone().select('id', 'category_id', 'name', 'sku', 'base_price', 'is_active', 'stock_quantity', 'preparation_time_min', 'sort_order'), { page, perPage }),
    ]);

    return ok(res, { data: items, meta: { pagination: buildPaginationMeta(Number(total), page, perPage) } });
  } catch (err) {
    return next(err);
  }
}

async function get(req, res, next) {
  try {
    const product = await db('products')
      .where({ id: req.params.productId, restaurant_id: req.restaurant.id })
      .whereNull('deleted_at')
      .first();

    assertOwnership(product);

    const images = await db('product_images')
      .where({ product_id: product.id })
      .whereNull('deleted_at')
      .orderBy('sort_order')
      .select('id', 'image_url', 'sort_order', 'is_primary');

    return ok(res, { data: { ...product, images } });
  } catch (err) {
    return next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name, slug, ...rest } = req.body;
    const generatedSlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const [id] = await db('products').insert({
      restaurant_id: req.restaurant.id,
      name,
      slug: generatedSlug,
      ...rest,
    });

    return created(res, { data: { id, slug: generatedSlug }, message: 'Produto criado.' });
  } catch (err) {
    return next(err);
  }
}

async function update(req, res, next) {
  try {
    const row = await db('products')
      .where({ id: req.params.productId, restaurant_id: req.restaurant.id })
      .whereNull('deleted_at')
      .first();

    assertOwnership(row);
    await db('products').where({ id: row.id }).update(req.body);
    return ok(res, { message: 'Produto atualizado.' });
  } catch (err) {
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    const affected = await db('products')
      .where({ id: req.params.productId, restaurant_id: req.restaurant.id })
      .whereNull('deleted_at')
      .update({ deleted_at: new Date() });

    if (!affected) throw new NotFoundError('Produto não encontrado.');
    return noContent(res);
  } catch (err) {
    return next(err);
  }
}

async function toggleStatus(req, res, next) {
  try {
    const product = await db('products')
      .where({ id: req.params.productId, restaurant_id: req.restaurant.id })
      .whereNull('deleted_at')
      .select('id', 'is_active')
      .first();

    assertOwnership(product);
    await db('products').where({ id: product.id }).update({ is_active: !product.is_active });
    return ok(res, { data: { is_active: !product.is_active } });
  } catch (err) {
    return next(err);
  }
}

async function updateStock(req, res, next) {
  try {
    const { stock_quantity } = req.body;
    if (stock_quantity === undefined) throw new BadRequestError('stock_quantity é obrigatório.');

    const affected = await db('products')
      .where({ id: req.params.productId, restaurant_id: req.restaurant.id })
      .whereNull('deleted_at')
      .update({ stock_quantity, stock_control_enabled: true });

    if (!affected) throw new NotFoundError('Produto não encontrado.');
    return ok(res, { message: 'Estoque atualizado.' });
  } catch (err) {
    return next(err);
  }
}

async function addImage(req, res, next) {
  try {
    // TODO: integrar com upload S3 — req.file virá do multer
    const { image_url, sort_order, is_primary } = req.body;
    if (!image_url) throw new BadRequestError('image_url é obrigatório.');

    const [id] = await db('product_images').insert({
      product_id: req.params.productId,
      image_url,
      sort_order: sort_order || 0,
      is_primary: is_primary || false,
    });

    return created(res, { data: { id }, message: 'Imagem adicionada.' });
  } catch (err) {
    return next(err);
  }
}

async function removeImage(req, res, next) {
  try {
    const affected = await db('product_images')
      .where({ id: req.params.imageId, product_id: req.params.productId })
      .whereNull('deleted_at')
      .update({ deleted_at: new Date() });

    if (!affected) throw new NotFoundError('Imagem não encontrada.');
    return noContent(res);
  } catch (err) {
    return next(err);
  }
}

async function listAddonGroups(req, res, next) {
  try {
    const groups = await db('product_addon_groups as pag')
      .join('addon_groups as ag', 'ag.id', 'pag.addon_group_id')
      .where({ 'pag.product_id': req.params.productId })
      .whereNull('pag.deleted_at')
      .select('ag.id', 'ag.name', 'ag.min_select', 'ag.max_select', 'ag.is_required');

    return ok(res, { data: groups });
  } catch (err) {
    return next(err);
  }
}

async function linkAddonGroup(req, res, next) {
  try {
    const { addon_group_id } = req.body;
    const [id] = await db('product_addon_groups').insert({
      product_id: req.params.productId,
      addon_group_id,
    });

    return created(res, { data: { id }, message: 'Grupo vinculado.' });
  } catch (err) {
    return next(err);
  }
}

async function unlinkAddonGroup(req, res, next) {
  try {
    const affected = await db('product_addon_groups')
      .where({ product_id: req.params.productId, addon_group_id: req.params.addonGroupId })
      .whereNull('deleted_at')
      .update({ deleted_at: new Date() });

    if (!affected) throw new NotFoundError('Vínculo não encontrado.');
    return noContent(res);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  list, get, create, update, remove,
  toggleStatus, updateStock,
  addImage, removeImage,
  listAddonGroups, linkAddonGroup, unlinkAddonGroup,
};
