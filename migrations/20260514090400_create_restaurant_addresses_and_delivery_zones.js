'use strict';

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('restaurant_addresses', (table) => {
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
      .bigInteger('address_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('addresses')
      .onDelete('RESTRICT');
    table.boolean('is_primary').notNullable().defaultTo(false);
    table.boolean('is_pickup_point').notNullable().defaultTo(true);

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table
      .timestamp('updated_at')
      .notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    table.timestamp('deleted_at').nullable();

    table.unique(['restaurant_id', 'address_id'], 'uq_restaurant_addresses_restaurant_address');
    table.index(['restaurant_id', 'is_primary'], 'idx_restaurant_addresses_primary');
    table.index(['deleted_at'], 'idx_restaurant_addresses_deleted_at');
  });

  await knex.schema.createTable('delivery_zones', (table) => {
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
    table
      .enum('zone_type', ['radius', 'polygon'], {
        useNative: false,
        enumName: 'delivery_zones_type_enum',
      })
      .notNullable()
      .defaultTo('radius');

    table.decimal('radius_km', 8, 3).nullable();
    table.longtext('polygon_geojson').nullable();
    table.decimal('minimum_order_value', 12, 2).notNullable().defaultTo(0);
    table.decimal('delivery_fee', 12, 2).notNullable().defaultTo(0);
    table.integer('estimated_delivery_time_min').unsigned().notNullable().defaultTo(45);
    table.boolean('is_active').notNullable().defaultTo(true);

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table
      .timestamp('updated_at')
      .notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    table.timestamp('deleted_at').nullable();

    table.index(['restaurant_id', 'is_active'], 'idx_delivery_zones_restaurant_active');
    table.index(['deleted_at'], 'idx_delivery_zones_deleted_at');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('delivery_zones');
  await knex.schema.dropTableIfExists('restaurant_addresses');
};
