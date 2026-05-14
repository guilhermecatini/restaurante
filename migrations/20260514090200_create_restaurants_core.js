'use strict';

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('restaurants', (table) => {
    table.engine('InnoDB');
    table.charset('utf8mb4');
    table.collate('utf8mb4_unicode_ci');

    table.bigIncrements('id').unsigned().primary();
    table.string('slug', 120).notNullable();
    table.string('legal_name', 180).notNullable();
    table.string('trade_name', 180).notNullable();
    table.string('document_number', 30).nullable();
    table.string('support_phone', 20).nullable();
    table.string('support_email', 255).nullable();
    table.string('logo_url', 500).nullable();
    table.string('banner_url', 500).nullable();
    table.text('description').nullable();

    table
      .enum('status', ['pending_approval', 'active', 'temporarily_closed', 'inactive', 'suspended'], {
        useNative: false,
        enumName: 'restaurants_status_enum',
      })
      .notNullable()
      .defaultTo('pending_approval');

    table.boolean('is_open').notNullable().defaultTo(false);
    table.decimal('minimum_order_value', 12, 2).notNullable().defaultTo(0);
    table.decimal('base_delivery_fee', 12, 2).notNullable().defaultTo(0);
    table.integer('avg_preparation_time_min').unsigned().notNullable().defaultTo(30);
    table.boolean('accepts_pickup').notNullable().defaultTo(true);
    table.boolean('accepts_delivery').notNullable().defaultTo(true);

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table
      .timestamp('updated_at')
      .notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    table.timestamp('deleted_at').nullable();

    table.unique(['slug'], 'uq_restaurants_slug');
    table.unique(['document_number'], 'uq_restaurants_document_number');
    table.index(['status', 'is_open'], 'idx_restaurants_status_open');
    table.index(['trade_name'], 'idx_restaurants_trade_name');
    table.index(['deleted_at'], 'idx_restaurants_deleted_at');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('restaurants');
};
