'use strict';

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('favorites', (table) => {
    table.engine('InnoDB');
    table.charset('utf8mb4');
    table.collate('utf8mb4_unicode_ci');

    table.bigIncrements('id').unsigned().primary();
    table
      .bigInteger('user_id')
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

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table
      .timestamp('updated_at')
      .notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    table.timestamp('deleted_at').nullable();

    table.unique(['user_id', 'restaurant_id'], 'uq_favorites_user_restaurant');
    table.index(['restaurant_id'], 'idx_favorites_restaurant_id');
    table.index(['deleted_at'], 'idx_favorites_deleted_at');
  });

  await knex.schema.createTable('restaurant_reviews', (table) => {
    table.engine('InnoDB');
    table.charset('utf8mb4');
    table.collate('utf8mb4_unicode_ci');

    table.bigIncrements('id').unsigned().primary();
    table
      .bigInteger('order_id')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('orders')
      .onDelete('SET NULL');
    table
      .bigInteger('restaurant_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('restaurants')
      .onDelete('CASCADE');
    table
      .bigInteger('user_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');

    table.integer('rating').unsigned().notNullable();
    table.text('comment').nullable();
    table.boolean('is_visible').notNullable().defaultTo(true);

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table
      .timestamp('updated_at')
      .notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    table.timestamp('deleted_at').nullable();

    table.unique(['order_id', 'user_id'], 'uq_restaurant_reviews_order_user');
    table.index(['restaurant_id', 'rating'], 'idx_restaurant_reviews_restaurant_rating');
    table.index(['deleted_at'], 'idx_restaurant_reviews_deleted_at');
  });

  await knex.schema.createTable('order_reviews', (table) => {
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
      .bigInteger('user_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');

    table.integer('delivery_rating').unsigned().nullable();
    table.integer('packaging_rating').unsigned().nullable();
    table.integer('overall_rating').unsigned().notNullable();
    table.text('comment').nullable();

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table
      .timestamp('updated_at')
      .notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    table.timestamp('deleted_at').nullable();

    table.unique(['order_id', 'user_id'], 'uq_order_reviews_order_user');
    table.index(['overall_rating'], 'idx_order_reviews_overall_rating');
    table.index(['deleted_at'], 'idx_order_reviews_deleted_at');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('order_reviews');
  await knex.schema.dropTableIfExists('restaurant_reviews');
  await knex.schema.dropTableIfExists('favorites');
};
