'use strict';

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('addresses', (table) => {
    table.engine('InnoDB');
    table.charset('utf8mb4');
    table.collate('utf8mb4_unicode_ci');

    table.bigIncrements('id').unsigned().primary();
    table.string('zip_code', 20).notNullable();
    table.string('street', 180).notNullable();
    table.string('number', 20).notNullable();
    table.string('complement', 120).nullable();
    table.string('neighborhood', 120).notNullable();
    table.string('city', 120).notNullable();
    table.string('state', 120).notNullable();
    table.string('country', 120).notNullable().defaultTo('Brazil');
    table.decimal('latitude', 10, 7).nullable();
    table.decimal('longitude', 10, 7).nullable();

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table
      .timestamp('updated_at')
      .notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    table.timestamp('deleted_at').nullable();

    table.index(['zip_code', 'city', 'state'], 'idx_addresses_zip_city_state');
    table.index(['deleted_at'], 'idx_addresses_deleted_at');
  });

  await knex.schema.createTable('user_addresses', (table) => {
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
      .bigInteger('address_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('addresses')
      .onDelete('RESTRICT');
    table.string('label', 80).notNullable().defaultTo('Home');
    table.boolean('is_default').notNullable().defaultTo(false);
    table.string('reference_note', 255).nullable();

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table
      .timestamp('updated_at')
      .notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    table.timestamp('deleted_at').nullable();

    table.unique(['user_id', 'address_id'], 'uq_user_addresses_user_address');
    table.index(['user_id', 'is_default'], 'idx_user_addresses_user_default');
    table.index(['deleted_at'], 'idx_user_addresses_deleted_at');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('user_addresses');
  await knex.schema.dropTableIfExists('addresses');
};
