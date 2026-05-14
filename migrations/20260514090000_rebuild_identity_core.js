'use strict';

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.dropTableIfExists('password_reset_tokens');
  await knex.schema.dropTableIfExists('refresh_tokens');
  await knex.schema.dropTableIfExists('user_auth_providers');
  await knex.schema.dropTableIfExists('users');

  await knex.schema.createTable('users', (table) => {
    table.engine('InnoDB');
    table.charset('utf8mb4');
    table.collate('utf8mb4_unicode_ci');

    table.bigIncrements('id').unsigned().primary();
    table.string('first_name', 100).notNullable();
    table.string('last_name', 100).notNullable();
    table.string('email', 255).notNullable();
    table.string('phone', 20).nullable();
    table.date('birth_date').nullable();
    table
      .enum('user_type', ['customer', 'restaurant_staff', 'platform_admin'], {
        useNative: false,
        enumName: 'users_user_type_enum',
      })
      .notNullable()
      .defaultTo('customer');
    table
      .enum('status', ['active', 'inactive', 'blocked', 'pending_verification'], {
        useNative: false,
        enumName: 'users_status_enum',
      })
      .notNullable()
      .defaultTo('pending_verification');
    table.boolean('is_email_verified').notNullable().defaultTo(false);
    table.boolean('is_phone_verified').notNullable().defaultTo(false);
    table.timestamp('last_login_at').nullable();

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table
      .timestamp('updated_at')
      .notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    table.timestamp('deleted_at').nullable();

    table.unique(['email'], 'uq_users_email');
    table.unique(['phone'], 'uq_users_phone');
    table.index(['user_type', 'status'], 'idx_users_type_status');
    table.index(['deleted_at'], 'idx_users_deleted_at');
  });

  await knex.schema.createTable('user_auth_providers', (table) => {
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
      .enum('provider', ['local', 'google', 'microsoft'], {
        useNative: false,
        enumName: 'user_auth_provider_enum',
      })
      .notNullable();
    table.string('provider_user_id', 255).nullable();
    table.string('password_hash', 255).nullable();
    table.boolean('is_primary').notNullable().defaultTo(false);
    table.timestamp('last_used_at').nullable();

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table
      .timestamp('updated_at')
      .notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    table.timestamp('deleted_at').nullable();

    table.unique(['provider', 'provider_user_id'], 'uq_auth_provider_external');
    table.unique(['user_id', 'provider'], 'uq_auth_user_provider');
    table.index(['user_id'], 'idx_auth_user_id');
    table.index(['deleted_at'], 'idx_auth_deleted_at');
  });

  await knex.schema.createTable('refresh_tokens', (table) => {
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
    table.string('token_hash', 128).notNullable();
    table.string('user_agent', 500).nullable();
    table.string('ip_address', 45).nullable();
    table.timestamp('expires_at').notNullable();
    table.timestamp('revoked_at').nullable();

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table
      .timestamp('updated_at')
      .notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    table.timestamp('deleted_at').nullable();

    table.unique(['token_hash'], 'uq_refresh_tokens_hash');
    table.index(['user_id', 'expires_at'], 'idx_refresh_user_expires');
    table.index(['revoked_at'], 'idx_refresh_revoked_at');
    table.index(['deleted_at'], 'idx_refresh_deleted_at');
  });

  await knex.schema.createTable('password_reset_tokens', (table) => {
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
    table.string('token_hash', 128).notNullable();
    table.timestamp('expires_at').notNullable();
    table.timestamp('used_at').nullable();

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table
      .timestamp('updated_at')
      .notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    table.timestamp('deleted_at').nullable();

    table.unique(['token_hash'], 'uq_password_reset_token_hash');
    table.index(['user_id', 'expires_at'], 'idx_password_reset_user_expires');
    table.index(['deleted_at'], 'idx_password_reset_deleted_at');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('password_reset_tokens');
  await knex.schema.dropTableIfExists('refresh_tokens');
  await knex.schema.dropTableIfExists('user_auth_providers');
  await knex.schema.dropTableIfExists('users');
};
