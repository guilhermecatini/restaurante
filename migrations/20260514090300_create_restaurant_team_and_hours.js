'use strict';

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('restaurant_users', (table) => {
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
      .bigInteger('user_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table
      .enum('role', ['owner', 'manager', 'attendant', 'kitchen', 'courier', 'finance'], {
        useNative: false,
        enumName: 'restaurant_users_role_enum',
      })
      .notNullable();
    table.boolean('is_active').notNullable().defaultTo(true);

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table
      .timestamp('updated_at')
      .notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    table.timestamp('deleted_at').nullable();

    table.unique(['restaurant_id', 'user_id'], 'uq_restaurant_users_restaurant_user');
    table.index(['restaurant_id', 'role'], 'idx_restaurant_users_restaurant_role');
    table.index(['user_id'], 'idx_restaurant_users_user_id');
    table.index(['deleted_at'], 'idx_restaurant_users_deleted_at');
  });

  await knex.schema.createTable('operating_hours', (table) => {
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
    table.integer('weekday').unsigned().notNullable().comment('0 = Sunday, 6 = Saturday');
    table.integer('shift_index').unsigned().notNullable().defaultTo(1);
    table.time('opens_at').nullable();
    table.time('closes_at').nullable();
    table.boolean('is_closed').notNullable().defaultTo(false);

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table
      .timestamp('updated_at')
      .notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    table.timestamp('deleted_at').nullable();

    table.unique(['restaurant_id', 'weekday', 'shift_index'], 'uq_operating_hours_unique_shift');
    table.index(['restaurant_id', 'weekday'], 'idx_operating_hours_restaurant_weekday');
    table.index(['deleted_at'], 'idx_operating_hours_deleted_at');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('operating_hours');
  await knex.schema.dropTableIfExists('restaurant_users');
};
