'use strict';

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('carts', (table) => {
    table.engine('InnoDB');
    table.charset('utf8mb4');
    table.collate('utf8mb4_unicode_ci');

    table.bigIncrements('id').unsigned().primary();
    table
      .bigInteger('customer_user_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table
      .bigInteger('restaurant_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('restaurants')
      .onDelete('CASCADE');
    table
      .enum('status', ['active', 'converted', 'abandoned', 'expired'], {
        useNative: false,
        enumName: 'carts_status_enum',
      })
      .notNullable()
      .defaultTo('active');
    table.text('customer_notes').nullable();
    table.timestamp('expires_at').nullable();

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table
      .timestamp('updated_at')
      .notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    table.timestamp('deleted_at').nullable();

    table.index(['customer_user_id', 'status'], 'idx_carts_customer_status');
    table.index(['restaurant_id', 'status'], 'idx_carts_restaurant_status');
    table.index(['deleted_at'], 'idx_carts_deleted_at');
  });

  await knex.schema.createTable('cart_items', (table) => {
    table.engine('InnoDB');
    table.charset('utf8mb4');
    table.collate('utf8mb4_unicode_ci');

    table.bigIncrements('id').unsigned().primary();
    table
      .bigInteger('cart_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('carts')
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

    table.integer('quantity').unsigned().notNullable().defaultTo(1);
    table.decimal('unit_price', 12, 2).notNullable();
    table.text('customer_notes').nullable();

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table
      .timestamp('updated_at')
      .notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    table.timestamp('deleted_at').nullable();

    table.index(['cart_id'], 'idx_cart_items_cart_id');
    table.index(['deleted_at'], 'idx_cart_items_deleted_at');
  });

  await knex.schema.createTable('cart_item_addons', (table) => {
    table.engine('InnoDB');
    table.charset('utf8mb4');
    table.collate('utf8mb4_unicode_ci');

    table.bigIncrements('id').unsigned().primary();
    table
      .bigInteger('cart_item_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('cart_items')
      .onDelete('CASCADE');
    table
      .bigInteger('addon_id')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('addons')
      .onDelete('SET NULL');

    table.integer('quantity').unsigned().notNullable().defaultTo(1);
    table.decimal('unit_price', 12, 2).notNullable().defaultTo(0);

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table
      .timestamp('updated_at')
      .notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    table.timestamp('deleted_at').nullable();

    table.index(['cart_item_id'], 'idx_cart_item_addons_item_id');
    table.index(['deleted_at'], 'idx_cart_item_addons_deleted_at');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('cart_item_addons');
  await knex.schema.dropTableIfExists('cart_items');
  await knex.schema.dropTableIfExists('carts');
};
