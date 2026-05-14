'use strict';

/**
 * Adiciona subdomain explícito para resolução multi-tenant.
 *
 * Estratégia:
 * 1) adiciona coluna nullable
 * 2) backfill com slug existente
 * 3) torna not null e cria índice único
 *
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.alterTable('restaurants', (table) => {
    table.string('subdomain', 120).nullable().after('slug');
  });

  await knex('restaurants')
    .whereNull('subdomain')
    .update({ subdomain: knex.ref('slug') });

  await knex.schema.alterTable('restaurants', (table) => {
    table.string('subdomain', 120).notNullable().alter();
    table.unique(['subdomain'], 'uq_restaurants_subdomain');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.alterTable('restaurants', (table) => {
    table.dropUnique(['subdomain'], 'uq_restaurants_subdomain');
    table.dropColumn('subdomain');
  });
};
