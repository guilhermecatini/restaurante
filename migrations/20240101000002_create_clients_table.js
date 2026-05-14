'use strict';

/**
 * Migration: Criação da tabela clients.
 *
 * Campos projetados para contexto de documentação técnica BRD/FRD,
 * incluindo identificação da empresa, contatos, objetivos de negócio,
 * restrições técnicas e stakeholders.
 *
 * @param {import('knex').Knex} knex
 */
exports.up = async function (knex) {
  await knex.schema.createTable('clients', (table) => {
    table.uuid('id').primary().notNullable().comment('Identificador único (UUID v4)');

    // -----------------------------------------------------------------------
    // Identificação da empresa
    // -----------------------------------------------------------------------
    table
      .string('company_name', 255)
      .notNullable()
      .comment('Razão social');

    table
      .string('trade_name', 255)
      .nullable()
      .comment('Nome fantasia');

    table
      .string('tax_id', 30)
      .nullable()
      .comment('CNPJ ou identificador fiscal');

    table
      .enum('company_size', ['micro', 'small', 'medium', 'large', 'enterprise'])
      .nullable()
      .comment('Porte da empresa');

    table
      .string('industry_sector', 100)
      .nullable()
      .comment('Setor de atuação (ex: Financeiro, Saúde, Varejo)');

    table
      .string('market_segment', 100)
      .nullable()
      .comment('Segmento de mercado (ex: B2B, B2C, SaaS)');

    table
      .string('website', 255)
      .nullable()
      .comment('Site da empresa');

    // -----------------------------------------------------------------------
    // Endereço
    // -----------------------------------------------------------------------
    table.string('address', 500).nullable().comment('Endereço completo');
    table.string('city', 100).nullable();
    table.string('state', 100).nullable().comment('Estado / UF');
    table.string('country', 100).nullable().defaultTo('Brasil');
    table.string('zip_code', 20).nullable().comment('CEP / código postal');

    // -----------------------------------------------------------------------
    // Contato responsável de negócio
    // -----------------------------------------------------------------------
    table
      .string('business_contact_name', 255)
      .nullable()
      .comment('Nome do responsável de negócio');

    table
      .string('business_contact_email', 255)
      .nullable()
      .comment('E-mail do responsável de negócio');

    table
      .string('business_contact_phone', 20)
      .nullable()
      .comment('Telefone do responsável de negócio');

    // -----------------------------------------------------------------------
    // Contato responsável técnico
    // -----------------------------------------------------------------------
    table
      .string('technical_contact_name', 255)
      .nullable()
      .comment('Nome do responsável técnico');

    table
      .string('technical_contact_email', 255)
      .nullable()
      .comment('E-mail do responsável técnico');

    table
      .string('technical_contact_phone', 20)
      .nullable()
      .comment('Telefone do responsável técnico');

    // -----------------------------------------------------------------------
    // Contexto BRD/FRD
    // -----------------------------------------------------------------------
    table
      .text('business_objectives')
      .nullable()
      .comment('Objetivos de negócio — texto livre para uso em BRD/FRD');

    table
      .text('technical_constraints')
      .nullable()
      .comment('Restrições técnicas conhecidas — texto livre');

    table
      .json('stakeholders')
      .nullable()
      .comment('Array JSON de stakeholders: [{ name, role, email }]');

    table
      .text('notes')
      .nullable()
      .comment('Observações adicionais sobre o cliente');

    // -----------------------------------------------------------------------
    // Relacionamento e status
    // -----------------------------------------------------------------------
    table
      .enum('status', ['active', 'prospect', 'closed'])
      .notNullable()
      .defaultTo('prospect')
      .comment('Status do cliente no pipeline');

    table
      .date('relationship_start_date')
      .nullable()
      .comment('Data de início do relacionamento comercial');

    // -----------------------------------------------------------------------
    // Auditoria
    // -----------------------------------------------------------------------
    table
      .uuid('created_by')
      .nullable()
      .references('id')
      .inTable('users')
      .onDelete('SET NULL')
      .comment('Usuário que criou o registro');

    table
      .boolean('is_active')
      .notNullable()
      .defaultTo(true)
      .comment('Soft delete flag');

    table.timestamps(true, true);

    // Índices
    table.index(['status'], 'idx_clients_status');
    table.index(['market_segment'], 'idx_clients_market_segment');
    table.index(['is_active'], 'idx_clients_is_active');
    table.index(['company_name'], 'idx_clients_company_name');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('clients');
};
