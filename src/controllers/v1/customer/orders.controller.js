'use strict';

const { db } = require('../../../config/database');
const { ok, created } = require('../../../shared/response');
const { parsePagination, applyPagination, buildPaginationMeta } = require('../../../shared/pagination');
const { BadRequestError, NotFoundError, ConflictError } = require('../../../errors/AppError');
const crypto = require('crypto');

function generateOrderNumber() {
  return `ORD-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

async function list(req, res, next) {
  try {
    const { page, perPage } = parsePagination(req, { defaultSort: 'created_at' });

    const [{ total }, items] = await Promise.all([
      db('orders').where({ customer_user_id: req.user.id }).whereNull('deleted_at').count('id as total').first(),
      applyPagination(
        db('orders as o')
          .join('restaurants as r', 'r.id', 'o.restaurant_id')
          .where({ 'o.customer_user_id': req.user.id })
          .whereNull('o.deleted_at')
          .select('o.id', 'o.order_number', 'o.status', 'o.payment_status',
            'o.total_amount', 'o.order_type', 'o.placed_at',
            'r.trade_name as restaurant_name', 'r.logo_url')
          .orderBy('o.created_at', 'desc'),
        { page, perPage }
      ),
    ]);

    return ok(res, { data: items, meta: { pagination: buildPaginationMeta(Number(total), page, perPage) } });
  } catch (err) {
    return next(err);
  }
}

async function place(req, res, next) {
  try {
    const { cart_id, delivery_address_id, order_type, coupon_code, payment_method, customer_notes } = req.body;

    const cart = await db('carts')
      .where({ id: cart_id, customer_user_id: req.user.id, status: 'active' })
      .whereNull('deleted_at')
      .first();

    if (!cart) throw new NotFoundError('Carrinho não encontrado ou já convertido.');

    const cartItems = await db('cart_items as ci')
      .where({ 'ci.cart_id': cart_id })
      .whereNull('ci.deleted_at')
      .select('ci.id', 'ci.product_id', 'ci.combo_id', 'ci.quantity', 'ci.unit_price', 'ci.customer_notes');

    if (!cartItems.length) throw new BadRequestError('Carrinho está vazio.');

    // Subtotal
    let subtotal = cartItems.reduce((s, i) => s + Number(i.unitPrice || i.unit_price || 0) * Number(i.quantity || 1), 0);

    const cartItemIds = cartItems.map((i) => i.id);
    const cartAddons = await db('cart_item_addons')
      .whereIn('cart_item_id', cartItemIds)
      .whereNull('deleted_at')
      .select('cart_item_id', 'addon_id', 'quantity', 'unit_price');

    const addonsTotal = cartAddons.reduce((s, a) => s + Number(a.unitPrice || a.unit_price || 0) * Number(a.quantity || 1), 0);

    let discountAmount = 0;
    let couponId = null;

    if (coupon_code) {
      const now = new Date();
      const coupon = await db('coupons')
        .where('code', coupon_code.toUpperCase())
        .where('is_active', true)
        .where('starts_at', '<=', now)
        .where('ends_at', '>=', now)
        .whereNull('deleted_at')
        .first();

      if (coupon) {
        couponId = coupon.id;
        if ((coupon.discountType || coupon.discount_type) === 'percentage') {
          discountAmount = Math.min(
            (subtotal + addonsTotal) * (Number(coupon.discountValue || coupon.discount_value || 0) / 100),
            Number(coupon.maxDiscountAmount || coupon.max_discount_amount || Infinity)
          );
        } else if ((coupon.discountType || coupon.discount_type) === 'fixed_amount') {
          discountAmount = Math.min(Number(coupon.discountValue || coupon.discount_value || 0), subtotal + addonsTotal);
        }
      }
    }

    const restaurantId = Number(cart.restaurantId || cart.restaurant_id);
    if (!restaurantId) throw new BadRequestError('Carrinho sem restaurante associado.');

    const restaurant = await db('restaurants').where({ id: restaurantId }).first();
    if (!restaurant) throw new NotFoundError('Restaurante não encontrado para o carrinho.');

    const deliveryFee = order_type === 'delivery'
      ? Number(restaurant.baseDeliveryFee || restaurant.base_delivery_fee || 0)
      : 0;
    const totalAmount = Math.max(0, subtotal + addonsTotal + deliveryFee - discountAmount);

    const [orderId] = await db('orders').insert({
      order_number: generateOrderNumber(),
      customer_user_id: req.user.id,
      restaurant_id: restaurantId,
      delivery_address_id: delivery_address_id || null,
      coupon_id: couponId,
      cart_id,
      order_type,
      status: 'placed',
      payment_status: 'pending',
      subtotal_amount: subtotal.toFixed(2),
      addons_amount: addonsTotal.toFixed(2),
      discount_amount: discountAmount.toFixed(2),
      delivery_fee: deliveryFee.toFixed(2),
      service_fee: '0.00',
      total_amount: totalAmount.toFixed(2),
      customer_notes: customer_notes || null,
      placed_at: new Date(),
    });

    // Insere order_items
    for (const item of cartItems) {
      const productId = item.productId || item.product_id;
      const comboId = item.comboId || item.combo_id;
      const itemUnitPrice = Number(item.unitPrice || item.unit_price || 0);

      const name = productId
        ? (await db('products').where({ id: productId }).select('name').first())?.name
        : (await db('combos').where({ id: comboId }).select('name').first())?.name;

      const [orderItemId] = await db('order_items').insert({
        order_id: orderId,
        product_id: productId || null,
        combo_id: comboId || null,
        item_name_snapshot: name || 'Item',
        quantity: item.quantity,
        unit_price: itemUnitPrice,
        total_price: (itemUnitPrice * Number(item.quantity || 1)).toFixed(2),
        customer_notes: item.customer_notes || null,
      });

      const itemAddons = cartAddons.filter((a) => (a.cartItemId || a.cart_item_id) === item.id);
      if (itemAddons.length) {
        const addonRows = await Promise.all(
          itemAddons.map(async (a) => {
            const addonId = a.addonId || a.addon_id;
            const addonUnitPrice = Number(a.unitPrice || a.unit_price || 0);
            const addon = await db('addons').where({ id: addonId }).select('name').first();
            return {
              order_item_id: orderItemId,
              addon_id: addonId,
              addon_name_snapshot: addon?.name || 'Adicional',
              quantity: a.quantity,
              unit_price: addonUnitPrice,
              total_price: (addonUnitPrice * Number(a.quantity || 1)).toFixed(2),
            };
          })
        );
        await db('order_item_addons').insert(addonRows);
      }
    }

    // Registra pagamento pendente
    await db('payments').insert({
      order_id: orderId,
      payment_method,
      status: 'pending',
      amount: totalAmount.toFixed(2),
    });

    // Converte carrinho
    await db('carts').where({ id: cart_id }).update({ status: 'converted' });

    // Registra resgate do cupom
    if (couponId) {
      await db('coupon_redemptions').insert({
        coupon_id: couponId,
        user_id: req.user.id,
        order_id: orderId,
        discount_amount: discountAmount.toFixed(2),
      });
      await db('coupons').where({ id: couponId }).increment('used_count', 1);
    }

    return created(res, {
      data: { order_id: orderId, total_amount: totalAmount.toFixed(2) },
      message: 'Pedido realizado com sucesso.',
    });
  } catch (err) {
    return next(err);
  }
}

async function get(req, res, next) {
  try {
    const order = req.order;

    const [items, payment] = await Promise.all([
      db('order_items as oi')
        .where({ 'oi.order_id': order.id })
        .whereNull('oi.deleted_at')
        .select('oi.id', 'oi.item_name_snapshot', 'oi.quantity', 'oi.unit_price', 'oi.total_price', 'oi.customer_notes'),
      db('payments').where({ order_id: order.id }).whereNull('deleted_at').orderBy('created_at', 'desc').first(),
    ]);

    return ok(res, { data: { ...order, items, payment } });
  } catch (err) {
    return next(err);
  }
}

async function track(req, res, next) {
  try {
    const { order_number, status, placed_at, confirmed_at, prepared_at, dispatched_at, delivered_at, canceled_at } = req.order;
    return ok(res, {
      data: {
        orderNumber: order_number,
        status,
        placedAt: placed_at,
        confirmedAt: confirmed_at,
        preparedAt: prepared_at,
        dispatchedAt: dispatched_at,
        deliveredAt: delivered_at,
        canceledAt: canceled_at,
        // Compatibilidade retroativa
        order_number,
        placed_at,
        confirmed_at,
        prepared_at,
        dispatched_at,
        delivered_at,
        canceled_at,
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function cancel(req, res, next) {
  try {
    const CANCELLABLE_STATUSES = ['placed', 'confirmed'];
    if (!CANCELLABLE_STATUSES.includes(req.order.status)) {
      throw new BadRequestError(`Pedido no status "${req.order.status}" não pode ser cancelado pelo cliente.`);
    }

    await db('orders').where({ id: req.order.id }).update({
      status: 'canceled',
      payment_status: 'canceled',
      cancellation_reason: 'Cancelado pelo cliente.',
      canceled_at: new Date(),
    });

    return ok(res, { message: 'Pedido cancelado com sucesso.' });
  } catch (err) {
    return next(err);
  }
}

module.exports = { list, place, get, track, cancel };
