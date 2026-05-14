'use strict';

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('addon_groups', (table) => {
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

    table.string('name', 160).notNullable();
    table.string('description', 255).nullable();
    table.integer('min_select').unsigned().notNullable().defaultTo(0);
    table.integer('max_select').unsigned().notNullable().defaultTo(1);
    table.boolean('is_required').notNullable().defaultTo(false);
    table.boolean('is_active').notNullable().defaultTo(true);
    table.integer('sort_order').unsigned().notNullable().defaultTo(0);

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table
      .timestamp('updated_at')
      .notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    table.timestamp('deleted_at').nullable();

    table.index(['restaurant_id', 'is_active'], 'idx_addon_groups_restaurant_active');
    table.index(['deleted_at'], 'idx_addon_groups_deleted_at');
  });

  await knex.schema.createTable('addons', (table) => {
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
      .bigInteger('addon_group_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('addon_groups')
      .onDelete('CASCADE');

    table.string('name', 160).notNullable();
    table.string('description', 255).nullable();
    table.decimal('price_delta', 12, 2).notNullable().defaultTo(0);
    table.boolean('is_active').notNullable().defaultTo(true);
    table.integer('sort_order').unsigned().notNullable().defaultTo(0);

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table
      .timestamp('updated_at')
      .notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    table.timestamp('deleted_at').nullable();

    table.index(['addon_group_id', 'is_active'], 'idx_addons_group_active');
    table.index(['restaurant_id'], 'idx_addons_restaurant_id');
    table.index(['deleted_at'], 'idx_addons_deleted_at');
  });

  await knex.schema.createTable('product_addon_groups', (table) => {
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
    table
      .bigInteger('addon_group_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('addon_groups')
      .onDelete('CASCADE');

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table
      .timestamp('updated_at')
      .notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    table.timestamp('deleted_at').nullable();

    table.unique(['product_id', 'addon_group_id'], 'uq_product_addon_groups_unique');
    table.index(['deleted_at'], 'idx_product_addon_groups_deleted_at');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('product_addon_groups');
  await knex.schema.dropTableIfExists('addons');
  await knex.schema.dropTableIfExists('addon_groups');
};
