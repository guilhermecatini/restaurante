'use strict';

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('orders', (table) => {
    table.engine('InnoDB');
    table.charset('utf8mb4');
    table.collate('utf8mb4_unicode_ci');

    table.bigIncrements('id').unsigned().primary();
    table.string('order_number', 40).notNullable();

    table
      .bigInteger('customer_user_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('RESTRICT');
    table
      .bigInteger('restaurant_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('restaurants')
      .onDelete('RESTRICT');
    table
      .bigInteger('delivery_address_id')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('addresses')
      .onDelete('SET NULL');
    table
      .bigInteger('coupon_id')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('coupons')
      .onDelete('SET NULL');
    table
      .bigInteger('cart_id')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('carts')
      .onDelete('SET NULL');

    table
      .enum('order_type', ['delivery', 'pickup'], {
        useNative: false,
        enumName: 'orders_type_enum',
      })
      .notNullable()
      .defaultTo('delivery');

    table
      .enum(
        'status',
        ['placed', 'confirmed', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'canceled'],
        {
          useNative: false,
          enumName: 'orders_status_enum',
        }
      )
      .notNullable()
      .defaultTo('placed');

    table
      .enum('payment_status', ['pending', 'authorized', 'paid', 'failed', 'refunded', 'canceled'], {
        useNative: false,
        enumName: 'orders_payment_status_enum',
      })
      .notNullable()
      .defaultTo('pending');

    table.decimal('subtotal_amount', 12, 2).notNullable().defaultTo(0);
    table.decimal('addons_amount', 12, 2).notNullable().defaultTo(0);
    table.decimal('discount_amount', 12, 2).notNullable().defaultTo(0);
    table.decimal('delivery_fee', 12, 2).notNullable().defaultTo(0);
    table.decimal('service_fee', 12, 2).notNullable().defaultTo(0);
    table.decimal('total_amount', 12, 2).notNullable().defaultTo(0);

    table.text('customer_notes').nullable();
    table.text('restaurant_notes').nullable();
    table.text('cancellation_reason').nullable();

    table.timestamp('placed_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('confirmed_at').nullable();
    table.timestamp('prepared_at').nullable();
    table.timestamp('dispatched_at').nullable();
    table.timestamp('delivered_at').nullable();
    table.timestamp('canceled_at').nullable();

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table
      .timestamp('updated_at')
      .notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    table.timestamp('deleted_at').nullable();

    table.unique(['order_number'], 'uq_orders_order_number');
    table.index(['restaurant_id', 'status', 'created_at'], 'idx_orders_restaurant_status_created');
    table.index(['customer_user_id', 'created_at'], 'idx_orders_customer_created');
    table.index(['payment_status'], 'idx_orders_payment_status');
    table.index(['deleted_at'], 'idx_orders_deleted_at');
  });

  await knex.schema.createTable('order_items', (table) => {
    table.engine('InnoDB');
    table.charset('utf8mb4');
    table.collate('utf8mb4_unicode_ci');

    table.bigIncrements('id').unsigned().primary();
    table
      .bigInteger('order_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('orders')
      .onDelete('CASCADE');
    table
      .bigInteger('product_id')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('products')
      .onDelete('SET NULL');
    table
      .bigInteger('combo_id')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('combos')
      .onDelete('SET NULL');

    table.string('item_name_snapshot', 180).notNullable();
    table.integer('quantity').unsigned().notNullable().defaultTo(1);
    table.decimal('unit_price', 12, 2).notNullable();
    table.decimal('total_price', 12, 2).notNullable();
    table.text('customer_notes').nullable();

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table
      .timestamp('updated_at')
      .notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    table.timestamp('deleted_at').nullable();

    table.index(['order_id'], 'idx_order_items_order_id');
    table.index(['product_id'], 'idx_order_items_product_id');
    table.index(['deleted_at'], 'idx_order_items_deleted_at');
  });

  await knex.schema.createTable('order_item_addons', (table) => {
    table.engine('InnoDB');
    table.charset('utf8mb4');
    table.collate('utf8mb4_unicode_ci');

    table.bigIncrements('id').unsigned().primary();
    table
      .bigInteger('order_item_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('order_items')
      .onDelete('CASCADE');
    table
      .bigInteger('addon_id')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('addons')
      .onDelete('SET NULL');

    table.string('addon_name_snapshot', 160).notNullable();
    table.integer('quantity').unsigned().notNullable().defaultTo(1);
    table.decimal('unit_price', 12, 2).notNullable().defaultTo(0);
    table.decimal('total_price', 12, 2).notNullable().defaultTo(0);

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table
      .timestamp('updated_at')
      .notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    table.timestamp('deleted_at').nullable();

    table.index(['order_item_id'], 'idx_order_item_addons_item_id');
    table.index(['deleted_at'], 'idx_order_item_addons_deleted_at');
  });

  await knex.schema.createTable('payments', (table) => {
    table.engine('InnoDB');
    table.charset('utf8mb4');
    table.collate('utf8mb4_unicode_ci');

    table.bigIncrements('id').unsigned().primary();
    table
      .bigInteger('order_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('orders')
      .onDelete('CASCADE');

    table
      .enum('payment_method', ['pix', 'credit_card', 'debit_card', 'cash', 'wallet'], {
        useNative: false,
        enumName: 'payments_method_enum',
      })
      .notNullable();

    table
      .enum('status', ['pending', 'authorized', 'paid', 'failed', 'refunded', 'canceled'], {
        useNative: false,
        enumName: 'payments_status_enum',
      })
      .notNullable()
      .defaultTo('pending');

    table.string('provider_name', 80).nullable();
    table.string('provider_transaction_id', 140).nullable();
    table.string('authorization_code', 80).nullable();
    table.decimal('amount', 12, 2).notNullable();
    table.string('currency', 3).notNullable().defaultTo('BRL');
    table.json('metadata').nullable();
    table.timestamp('paid_at').nullable();

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table
      .timestamp('updated_at')
      .notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    table.timestamp('deleted_at').nullable();

    table.index(['order_id', 'status'], 'idx_payments_order_status');
    table.index(['provider_transaction_id'], 'idx_payments_provider_txn');
    table.index(['deleted_at'], 'idx_payments_deleted_at');
  });

  await knex.schema.alterTable('coupon_redemptions', (table) => {
    table
      .foreign('order_id', 'fk_coupon_redemptions_order_id')
      .references('id')
      .inTable('orders')
      .onDelete('SET NULL');
    table.index(['order_id'], 'idx_coupon_redemptions_order_id');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.alterTable('coupon_redemptions', (table) => {
    table.dropForeign(['order_id'], 'fk_coupon_redemptions_order_id');
    table.dropIndex(['order_id'], 'idx_coupon_redemptions_order_id');
  });

  await knex.schema.dropTableIfExists('payments');
  await knex.schema.dropTableIfExists('order_item_addons');
  await knex.schema.dropTableIfExists('order_items');
  await knex.schema.dropTableIfExists('orders');
};
