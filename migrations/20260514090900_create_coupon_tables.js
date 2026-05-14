'use strict';

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('coupons', (table) => {
    table.engine('InnoDB');
    table.charset('utf8mb4');
    table.collate('utf8mb4_unicode_ci');

    table.bigIncrements('id').unsigned().primary();
    table
      .bigInteger('restaurant_id')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('restaurants')
      .onDelete('CASCADE');

    table.string('code', 60).notNullable();
    table
      .enum('discount_type', ['percentage', 'fixed_amount', 'free_delivery'], {
        useNative: false,
        enumName: 'coupons_discount_type_enum',
      })
      .notNullable();
    table.decimal('discount_value', 12, 2).notNullable().defaultTo(0);
    table.decimal('max_discount_amount', 12, 2).nullable();
    table.decimal('min_order_value', 12, 2).notNullable().defaultTo(0);
    table.integer('usage_limit_total').unsigned().nullable();
    table.integer('usage_limit_per_user').unsigned().nullable();
    table.integer('used_count').unsigned().notNullable().defaultTo(0);
    table.timestamp('starts_at').notNullable();
    table.timestamp('ends_at').notNullable();
    table.boolean('is_active').notNullable().defaultTo(true);

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table
      .timestamp('updated_at')
      .notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    table.timestamp('deleted_at').nullable();

    table.unique(['restaurant_id', 'code'], 'uq_coupons_restaurant_code');
    table.index(['code'], 'idx_coupons_code');
    table.index(['is_active', 'starts_at', 'ends_at'], 'idx_coupons_active_window');
    table.index(['deleted_at'], 'idx_coupons_deleted_at');
  });

  await knex.schema.createTable('coupon_redemptions', (table) => {
    table.engine('InnoDB');
    table.charset('utf8mb4');
    table.collate('utf8mb4_unicode_ci');

    table.bigIncrements('id').unsigned().primary();
    table
      .bigInteger('coupon_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('coupons')
      .onDelete('CASCADE');
    table
      .bigInteger('user_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table.bigInteger('order_id').unsigned().nullable();
    table.decimal('discount_amount', 12, 2).notNullable().defaultTo(0);
    table.timestamp('redeemed_at').notNullable().defaultTo(knex.fn.now());

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table
      .timestamp('updated_at')
      .notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    table.timestamp('deleted_at').nullable();

    table.unique(['coupon_id', 'order_id'], 'uq_coupon_redemptions_coupon_order');
    table.index(['coupon_id', 'user_id'], 'idx_coupon_redemptions_coupon_user');
    table.index(['deleted_at'], 'idx_coupon_redemptions_deleted_at');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('coupon_redemptions');
  await knex.schema.dropTableIfExists('coupons');
};
