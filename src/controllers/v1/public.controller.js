'use strict';

/**
 * Controller de rotas públicas — listagem e busca de restaurantes.
 */

const { db } = require('../../config/database');
const { ok, paginated } = require('../../shared/response');
const { parsePagination, applyPagination, buildPaginationMeta } = require('../../shared/pagination');
const { NotFoundError } = require('../../errors/AppError');

async function listRestaurants(req, res, next) {
  try {
    const { page, perPage, sort, order } = parsePagination(req, {
      defaultSort: 'trade_name',
      allowedSorts: ['trade_name', 'created_at', 'avg_preparation_time_min'],
    });

    const { city, neighborhood, is_open } = req.query;

    const baseQuery = db('restaurants')
      .where('restaurants.status', 'active')
      .whereNull('restaurants.deleted_at');

    if (is_open !== undefined) {
      baseQuery.where('restaurants.is_open', is_open === 'true');
    }

    const countQuery = baseQuery.clone().count('restaurants.id as total').first();
    const dataQuery = applyPagination(
      baseQuery.clone()
        .join('restaurant_addresses as ra', function () {
          this.on('ra.restaurant_id', '=', 'restaurants.id')
            .andOn('ra.is_primary', '=', db.raw('1'))
            .andOnNull('ra.deleted_at');
        })
        .join('addresses as a', 'a.id', 'ra.address_id')
        .select(
          'restaurants.id',
          'restaurants.slug',
          'restaurants.trade_name',
          'restaurants.logo_url',
          'restaurants.is_open',
          'restaurants.avg_preparation_time_min',
          'restaurants.base_delivery_fee',
          'restaurants.minimum_order_value',
          'a.city',
          'a.neighborhood'
        )
        .orderBy(`restaurants.${sort}`, order),
      { page, perPage }
    );

    if (city) dataQuery.where('a.city', 'like', `%${city}%`);
    if (neighborhood) dataQuery.where('a.neighborhood', 'like', `%${neighborhood}%`);

    const [{ total }, items] = await Promise.all([countQuery, dataQuery]);

    return paginated(res, items, buildPaginationMeta(Number(total), page, perPage));
  } catch (err) {
    return next(err);
  }
}

async function searchRestaurants(req, res, next) {
  try {
    const { q } = req.query;
    const { page, perPage } = parsePagination(req);

    if (!q || q.trim().length < 2) {
      return ok(res, { data: [], meta: { pagination: buildPaginationMeta(0, 1, perPage) } });
    }

    const term = `%${q.trim()}%`;

    const items = await db('restaurants')
      .where('status', 'active')
      .whereNull('deleted_at')
      .where(function () {
        this.where('trade_name', 'like', term).orWhere('description', 'like', term);
      })
      .select('id', 'slug', 'trade_name', 'logo_url', 'is_open', 'avg_preparation_time_min')
      .limit(perPage)
      .offset((page - 1) * perPage);

    return ok(res, { data: items });
  } catch (err) {
    return next(err);
  }
}

async function getRestaurant(req, res, next) {
  try {
    const { restaurantId } = req.params;

    const restaurant = await db('restaurants')
      .where('restaurants.id', restaurantId)
      .where('restaurants.status', 'active')
      .whereNull('restaurants.deleted_at')
      .select(
        'restaurants.id',
        'restaurants.slug',
        'restaurants.trade_name',
        'restaurants.description',
        'restaurants.logo_url',
        'restaurants.banner_url',
        'restaurants.is_open',
        'restaurants.avg_preparation_time_min',
        'restaurants.base_delivery_fee',
        'restaurants.minimum_order_value',
        'restaurants.accepts_pickup',
        'restaurants.accepts_delivery'
      )
      .first();

    if (!restaurant) throw new NotFoundError('Restaurante não encontrado.');

    const [address, hours, avgRating] = await Promise.all([
      db('restaurant_addresses as ra')
        .join('addresses as a', 'a.id', 'ra.address_id')
        .where({ 'ra.restaurant_id': restaurantId, 'ra.is_primary': true })
        .whereNull('ra.deleted_at')
        .select('a.street', 'a.number', 'a.neighborhood', 'a.city', 'a.state')
        .first(),

      db('operating_hours')
        .where({ restaurant_id: restaurantId })
        .whereNull('deleted_at')
        .orderBy(['weekday', 'shift_index'])
        .select('weekday', 'shift_index', 'opens_at', 'closes_at', 'is_closed'),

      db('restaurant_reviews')
        .where({ restaurant_id: restaurantId, is_visible: true })
        .whereNull('deleted_at')
        .avg('rating as avg_rating')
        .count('id as total_reviews')
        .first(),
    ]);

    return ok(res, {
      data: {
        ...restaurant,
        address,
        operatingHours: hours,
        // Compatibilidade retroativa
        operating_hours: hours,
        rating: {
          average: avgRating?.avg_rating ? parseFloat(avgRating.avg_rating).toFixed(1) : null,
          total: Number(avgRating?.total_reviews) || 0,
        },
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function getRestaurantMenu(req, res, next) {
  try {
    const { restaurantId } = req.params;

    const [categories, products, addons, addonGroups, productAddonLinks, combos] =
      await Promise.all([
        db('categories')
          .where({ restaurant_id: restaurantId, is_active: true })
          .whereNull('deleted_at')
          .orderBy('sort_order')
          .select('id', 'name', 'slug'),

        db('products')
          .where({ restaurant_id: restaurantId, is_active: true })
          .whereNull('deleted_at')
          .orderBy(['category_id', 'sort_order'])
          .select('id', 'category_id', 'name', 'description', 'base_price', 'preparation_time_min'),

        db('addons as a')
          .join('addon_groups as ag', 'ag.id', 'a.addon_group_id')
          .where('ag.restaurant_id', restaurantId)
          .where('a.is_active', true)
          .whereNull('a.deleted_at')
          .select('a.id', 'a.addon_group_id', 'a.name', 'a.price_delta', 'a.sort_order'),

        db('addon_groups')
          .where({ restaurant_id: restaurantId, is_active: true })
          .whereNull('deleted_at')
          .orderBy('sort_order')
          .select('id', 'name', 'min_select', 'max_select', 'is_required'),

        db('product_addon_groups')
          .whereNull('deleted_at')
          .select('product_id', 'addon_group_id'),

        db('combos')
          .where({ restaurant_id: restaurantId, is_active: true })
          .whereNull('deleted_at')
          .select('id', 'name', 'description', 'combo_price', 'category_id'),
      ]);

    const addonsByGroup = addonGroups.map((group) => ({
      ...group,
      items: addons.filter((a) => a.addon_group_id === group.id),
    }));

    const productsWithAddons = products.map((product) => {
      const groupIds = productAddonLinks
        .filter((l) => l.product_id === product.id)
        .map((l) => l.addon_group_id);
      return {
        ...product,
        addon_groups: addonsByGroup.filter((g) => groupIds.includes(g.id)),
      };
    });

    const menu = categories.map((category) => ({
      ...category,
      products: productsWithAddons.filter((p) => p.category_id === category.id),
    }));

    return ok(res, { data: { categories: menu, combos } });
  } catch (err) {
    return next(err);
  }
}

async function getRestaurantReviews(req, res, next) {
  try {
    const { restaurantId } = req.params;
    const { page, perPage } = parsePagination(req);
    const rating = parseInt(req.query.rating, 10) || null;

    const query = db('restaurant_reviews as rr')
      .join('users as u', 'u.id', 'rr.user_id')
      .where({ 'rr.restaurant_id': restaurantId, 'rr.is_visible': true })
      .whereNull('rr.deleted_at');

    if (rating) query.where('rr.rating', rating);

    const [{ total }, items] = await Promise.all([
      query.clone().count('rr.id as total').first(),
      applyPagination(
        query.clone()
          .select('rr.id', 'rr.rating', 'rr.comment', 'rr.created_at',
            'u.first_name', 'u.last_name')
          .orderBy('rr.created_at', 'desc'),
        { page, perPage }
      ),
    ]);

    return paginated(res, items, buildPaginationMeta(Number(total), page, perPage));
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listRestaurants,
  searchRestaurants,
  getRestaurant,
  getRestaurantMenu,
  getRestaurantReviews,
};
