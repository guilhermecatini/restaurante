'use strict';

/**
 * Migration: Criação da tabela users e refresh_tokens.
 *
 * Inclui a tabela refresh_tokens para suporte ao fluxo de
 * renovação de access tokens e revogação no logout.
 *
 * @param {import('knex').Knex} knex
 */
exports.up = async function (knex) {
  // -------------------------------------------------------------------------
  // Tabela: users
  // -------------------------------------------------------------------------
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().notNullable().comment('Identificador único (UUID v4)');

    table
      .string('first_name', 100)
      .notNullable()
      .comment('Nome');

    table
      .string('last_name', 100)
      .notNullable()
      .comment('Sobrenome');

    table
      .date('birth_date')
      .notNullable()
      .comment('Data de nascimento');

    table
      .string('email', 255)
      .notNullable()
      .unique()
      .comment('E-mail — único na plataforma');

    table
      .string('phone', 20)
      .nullable()
      .comment('Telefone de contato');

    table
      .string('password_hash', 255)
      .nullable()
      .comment('Hash bcrypt da senha — null para usuários OAuth');

    table
      .enum('provider', ['local', 'google', 'microsoft'])
      .notNullable()
      .defaultTo('local')
      .comment('Provider de autenticação');

    table
      .string('provider_id', 255)
      .nullable()
      .comment('ID externo do provider OAuth');

    table
      .boolean('is_active')
      .notNullable()
      .defaultTo(true)
      .comment('Flag de soft delete — false = conta desativada');

    table.timestamps(true, true); // created_at e updated_at com DEFAULT CURRENT_TIMESTAMP

    // Índices para performance em queries frequentes
    table.index(['email'], 'idx_users_email');
    table.index(['provider', 'provider_id'], 'idx_users_provider');
    table.index(['is_active'], 'idx_users_is_active');
  });

  // -------------------------------------------------------------------------
  // Tabela: refresh_tokens
  // Armazena refresh tokens válidos para permitir revogação individual.
  // -------------------------------------------------------------------------
  await knex.schema.createTable('refresh_tokens', (table) => {
    table.uuid('id').primary().notNullable();

    table
      .uuid('user_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
      .comment('FK para o usuário dono do token');

    table
      .text('token')
      .notNullable()
      .comment('Valor do refresh token JWT');

    table
      .datetime('expires_at')
      .notNullable()
      .comment('Data/hora de expiração do token');

    table
      .timestamp('created_at')
      .defaultTo(knex.fn.now())
      .notNullable();

    // Índices para lookup rápido pelo token e limpeza por expiração
    table.index(['token'], 'idx_refresh_tokens_token');
    table.index(['user_id'], 'idx_refresh_tokens_user_id');
    table.index(['expires_at'], 'idx_refresh_tokens_expires_at');
  });
};

/**
 * Rollback: remove as tabelas na ordem inversa de criação (FK first).
 *
 * @param {import('knex').Knex} knex
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('refresh_tokens');
  await knex.schema.dropTableIfExists('users');
};
