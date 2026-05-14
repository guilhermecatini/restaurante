'use strict';

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('categories', (table) => {
    table.engine('InnoDB');
    table.charset('utf8mb4');
    table.collate('utf8mb4_unicode_ci');

    table.bigIncrements('id').unsigned().primary();
    table
      .bigInteger('restaurant_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('restaurants')
      .onDelete('CASCADE');
    table.string('name', 120).notNullable();
    table.string('slug', 160).notNullable();
    table.integer('sort_order').unsigned().notNullable().defaultTo(0);
    table.boolean('is_active').notNullable().defaultTo(true);

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table
      .timestamp('updated_at')
      .notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    table.timestamp('deleted_at').nullable();

    table.unique(['restaurant_id', 'slug'], 'uq_categories_restaurant_slug');
    table.index(['restaurant_id', 'is_active'], 'idx_categories_restaurant_active');
    table.index(['deleted_at'], 'idx_categories_deleted_at');
  });

  await knex.schema.createTable('products', (table) => {
    table.engine('InnoDB');
    table.charset('utf8mb4');
    table.collate('utf8mb4_unicode_ci');

    table.bigIncrements('id').unsigned().primary();
    table
      .bigInteger('restaurant_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('restaurants')
      .onDelete('CASCADE');
    table
      .bigInteger('category_id')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('categories')
      .onDelete('SET NULL');

    table.string('name', 180).notNullable();
    table.string('slug', 220).notNullable();
    table.text('description').nullable();
    table.string('sku', 80).nullable();
    table.decimal('base_price', 12, 2).notNullable();
    table.boolean('stock_control_enabled').notNullable().defaultTo(false);
    table.integer('stock_quantity').unsigned().nullable();
    table.integer('preparation_time_min').unsigned().notNullable().defaultTo(20);
    table.integer('sort_order').unsigned().notNullable().defaultTo(0);
    table.boolean('is_active').notNullable().defaultTo(true);

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table
      .timestamp('updated_at')
      .notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    table.timestamp('deleted_at').nullable();

    table.unique(['restaurant_id', 'slug'], 'uq_products_restaurant_slug');
    table.unique(['restaurant_id', 'sku'], 'uq_products_restaurant_sku');
    table.index(['restaurant_id', 'category_id'], 'idx_products_restaurant_category');
    table.index(['restaurant_id', 'is_active'], 'idx_products_restaurant_active');
    table.index(['deleted_at'], 'idx_products_deleted_at');
  });

  await knex.schema.createTable('product_images', (table) => {
    table.engine('InnoDB');
    table.charset('utf8mb4');
    table.collate('utf8mb4_unicode_ci');

    table.bigIncrements('id').unsigned().primary();
    table
      .bigInteger('product_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('products')
      .onDelete('CASCADE');
    table.string('image_url', 500).notNullable();
    table.integer('sort_order').unsigned().notNullable().defaultTo(0);
    table.boolean('is_primary').notNullable().defaultTo(false);

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table
      .timestamp('updated_at')
      .notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    table.timestamp('deleted_at').nullable();

    table.index(['product_id', 'sort_order'], 'idx_product_images_product_sort');
    table.index(['deleted_at'], 'idx_product_images_deleted_at');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('product_images');
  await knex.schema.dropTableIfExists('products');
  await knex.schema.dropTableIfExists('categories');
};
