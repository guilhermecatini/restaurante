'use strict';

const { db } = require('../../../config/database');
const { ok, created, noContent } = require('../../../shared/response');
const { NotFoundError, BadRequestError, ConflictError } = require('../../../errors/AppError');

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

async function getOrCreateActiveCart(userId, restaurantId) {
  let cart = await db('carts')
    .where({ customer_user_id: userId, restaurant_id: restaurantId, status: 'active' })
    .whereNull('deleted_at')
    .first();

  if (!cart) {
    const [id] = await db('carts').insert({
      customer_user_id: userId,
      restaurant_id: restaurantId,
      status: 'active',
    });
    cart = { id, customer_user_id: userId, restaurant_id: restaurantId };
  }

  return cart;
}

// --------------------------------------------------------------------------
// Handlers
// --------------------------------------------------------------------------

async function getCart(req, res, next) {
  try {
    const { restaurant_id } = req.query;
    if (!restaurant_id) throw new BadRequestError('Informe o restaurant_id.');

    const cart = await db('carts')
      .where({ customer_user_id: req.user.id, restaurant_id, status: 'active' })
      .whereNull('deleted_at')
      .first();

    if (!cart) return ok(res, { data: null });

    const items = await db('cart_items as ci')
      .leftJoin('products as p', 'p.id', 'ci.product_id')
      .leftJoin('combos as c', 'c.id', 'ci.combo_id')
      .where({ 'ci.cart_id': cart.id })
      .whereNull('ci.deleted_at')
      .select(
        'ci.id', 'ci.quantity', 'ci.unit_price', 'ci.customer_notes',
        'p.id as product_id', 'p.name as product_name',
        'c.id as combo_id', 'c.name as combo_name'
      );

    const itemIds = items.map((i) => i.id);
    const addons = itemIds.length
      ? await db('cart_item_addons as cia')
          .join('addons as a', 'a.id', 'cia.addon_id')
          .whereIn('cia.cart_item_id', itemIds)
          .whereNull('cia.deleted_at')
          .select('cia.cart_item_id', 'cia.quantity', 'cia.unit_price', 'a.name')
      : [];

    const itemsWithAddons = items.map((item) => ({
      ...item,
      addons: addons.filter((a) => a.cart_item_id === item.id),
    }));

    const total = itemsWithAddons.reduce(
      (sum, item) =>
        sum +
        item.unit_price * item.quantity +
        item.addons.reduce((s, a) => s + a.unit_price * a.quantity, 0),
      0
    );

    return ok(res, { data: { ...cart, items: itemsWithAddons, subtotal: total.toFixed(2) } });
  } catch (err) {
    return next(err);
  }
}

async function addItem(req, res, next) {
  try {
    const { restaurant_id, product_id, combo_id, quantity, customer_notes, addons } = req.body;

    const restaurant = await db('restaurants').where({ id: restaurant_id, status: 'active' }).whereNull('deleted_at').first();
    if (!restaurant) throw new NotFoundError('Restaurante não encontrado.');

    let unitPrice = 0;

    if (product_id) {
      const product = await db('products').where({ id: product_id, restaurant_id, is_active: true }).whereNull('deleted_at').first();
      if (!product) throw new NotFoundError('Produto não encontrado.');
      unitPrice = parseFloat(product.base_price);
    } else if (combo_id) {
      const combo = await db('combos').where({ id: combo_id, restaurant_id, is_active: true }).whereNull('deleted_at').first();
      if (!combo) throw new NotFoundError('Combo não encontrado.');
      unitPrice = parseFloat(combo.combo_price);
    }

    const cart = await getOrCreateActiveCart(req.user.id, restaurant_id);

    const [cartItemId] = await db('cart_items').insert({
      cart_id: cart.id,
      product_id: product_id || null,
      combo_id: combo_id || null,
      quantity,
      unit_price: unitPrice,
      customer_notes: customer_notes || null,
    });

    if (addons && addons.length > 0) {
      const addonRows = await Promise.all(
        addons.map(async (a) => {
          const addon = await db('addons').where({ id: a.addon_id, is_active: true }).whereNull('deleted_at').first();
          return addon
            ? { cart_item_id: cartItemId, addon_id: a.addon_id, quantity: a.quantity, unit_price: parseFloat(addon.price_delta) }
            : null;
        })
      );
      const validAddons = addonRows.filter(Boolean);
      if (validAddons.length) await db('cart_item_addons').insert(validAddons);
    }

    return created(res, {
      data: {
        cartItemId,
        // Compatibilidade retroativa
        cart_item_id: cartItemId,
      },
      message: 'Item adicionado ao carrinho.',
    });
  } catch (err) {
    return next(err);
  }
}

async function updateItem(req, res, next) {
  try {
    const { quantity, customer_notes } = req.body;

    const item = await db('cart_items as ci')
      .join('carts as c', 'c.id', 'ci.cart_id')
      .where({ 'ci.id': req.params.cartItemId, 'c.customer_user_id': req.user.id })
      .whereNull('ci.deleted_at')
      .select('ci.id')
      .first();

    if (!item) throw new NotFoundError('Item não encontrado no carrinho.');

    await db('cart_items').where({ id: item.id }).update({
      quantity,
      ...(customer_notes !== undefined && { customer_notes }),
    });

    return ok(res, { message: 'Item atualizado.' });
  } catch (err) {
    return next(err);
  }
}

async function removeItem(req, res, next) {
  try {
    const affected = await db('cart_items as ci')
      .join('carts as c', 'c.id', 'ci.cart_id')
      .where({ 'ci.id': req.params.cartItemId, 'c.customer_user_id': req.user.id })
      .whereNull('ci.deleted_at')
      .update({ 'ci.deleted_at': new Date() });

    if (!affected) throw new NotFoundError('Item não encontrado.');
    return noContent(res);
  } catch (err) {
    return next(err);
  }
}

async function clearCart(req, res, next) {
  try {
    const { restaurant_id } = req.query;
    if (!restaurant_id) throw new BadRequestError('Informe o restaurant_id.');

    await db('carts')
      .where({ customer_user_id: req.user.id, restaurant_id, status: 'active' })
      .whereNull('deleted_at')
      .update({ status: 'abandoned', deleted_at: new Date() });

    return noContent(res);
  } catch (err) {
    return next(err);
  }
}

async function validateCoupon(req, res, next) {
  try {
    const { coupon_code, restaurant_id } = req.body;
    if (!coupon_code || !restaurant_id) throw new BadRequestError('coupon_code e restaurant_id são obrigatórios.');

    const now = new Date();
    const coupon = await db('coupons')
      .where('code', coupon_code.toUpperCase())
      .where('is_active', true)
      .where('starts_at', '<=', now)
      .where('ends_at', '>=', now)
      .whereNull('deleted_at')
      .where(function () {
        this.whereNull('restaurant_id').orWhere('restaurant_id', restaurant_id);
      })
      .first();

    if (!coupon) return ok(res, { data: { valid: false, message: 'Cupom inválido ou expirado.' } });

    if (coupon.usage_limit_total && coupon.used_count >= coupon.usage_limit_total) {
      return ok(res, { data: { valid: false, message: 'Cupom esgotado.' } });
    }

    if (coupon.usage_limit_per_user) {
      const userUsage = await db('coupon_redemptions')
        .where({ coupon_id: coupon.id, user_id: req.user.id })
        .whereNull('deleted_at')
        .count('id as total')
        .first();
      if (Number(userUsage?.total) >= coupon.usage_limit_per_user) {
        return ok(res, { data: { valid: false, message: 'Você já usou este cupom o número máximo de vezes.' } });
      }
    }

    return ok(res, {
      data: {
        valid: true,
        coupon: {
          id: coupon.id,
          code: coupon.code,
          discount_type: coupon.discount_type,
          discount_value: coupon.discount_value,
          max_discount_amount: coupon.max_discount_amount,
          min_order_value: coupon.min_order_value,
        },
      },
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { getCart, addItem, updateItem, removeItem, clearCart, validateCoupon };
