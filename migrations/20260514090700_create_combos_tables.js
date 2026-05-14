'use strict';

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('combos', (table) => {
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
    table.decimal('combo_price', 12, 2).notNullable();
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamp('available_from').nullable();
    table.timestamp('available_until').nullable();

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table
      .timestamp('updated_at')
      .notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    table.timestamp('deleted_at').nullable();

    table.unique(['restaurant_id', 'slug'], 'uq_combos_restaurant_slug');
    table.index(['restaurant_id', 'is_active'], 'idx_combos_restaurant_active');
    table.index(['deleted_at'], 'idx_combos_deleted_at');
  });

  await knex.schema.createTable('combo_items', (table) => {
    table.engine('InnoDB');
    table.charset('utf8mb4');
    table.collate('utf8mb4_unicode_ci');

    table.bigIncrements('id').unsigned().primary();
    table
      .bigInteger('combo_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('combos')
      .onDelete('CASCADE');
    table
      .bigInteger('product_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('products')
      .onDelete('RESTRICT');

    table.integer('quantity').unsigned().notNullable().defaultTo(1);
    table.integer('min_quantity').unsigned().notNullable().defaultTo(1);
    table.integer('max_quantity').unsigned().notNullable().defaultTo(1);

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table
      .timestamp('updated_at')
      .notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    table.timestamp('deleted_at').nullable();

    table.unique(['combo_id', 'product_id'], 'uq_combo_items_combo_product');
    table.index(['combo_id'], 'idx_combo_items_combo_id');
    table.index(['deleted_at'], 'idx_combo_items_deleted_at');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('combo_items');
  await knex.schema.dropTableIfExists('combos');
};
