'use strict';

/**
 * Service de Clientes.
 *
 * Lógica de negócio para operações CRUD de clientes.
 * O campo `stakeholders` é armazenado como JSON no banco e serializado/
 * desserializado automaticamente pelo mysql2 (se a coluna for JSON)
 * ou manualmente aqui (se for TEXT).
 */

const { v4: uuidv4 } = require('uuid');

const { db } = require('../config/database');
const { TABLE_NAME, DEFAULTS } = require('../models/client.model');
const { AppError } = require('../middlewares/errorHandler.middleware');

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

/**
 * Serializa o campo stakeholders para string JSON se necessário.
 * O mysql2 pode retornar o campo JSON como string dependendo da versão.
 */
function parseStakeholders(value) {
  if (!value) return [];
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  }
  return Array.isArray(value) ? value : [];
}

/**
 * Normaliza um registro do banco para o formato da API (camelCase).
 * O Knex já faz a conversão snake_case → camelCase pelo postProcessResponse,
 * mas o campo JSON precisa de parse adicional.
 */
function normalize(client) {
  if (!client) return null;
  return {
    ...client,
    stakeholders: parseStakeholders(client.stakeholders),
  };
}

// --------------------------------------------------------------------------
// list
// --------------------------------------------------------------------------

/**
 * Lista clientes com paginação e filtros opcionais.
 *
 * @param {{ page: number, limit: number, status?: string, marketSegment?: string, search?: string }} params
 * @returns {Promise<{ data: object[], pagination: object }>}
 */
async function list({ page = 1, limit = 10, status, marketSegment, search }) {
  const offset = (page - 1) * limit;

  let query = db(TABLE_NAME).where({ is_active: true });

  if (status) {
    query = query.where({ status });
  }

  if (marketSegment) {
    query = query.whereILike('market_segment', `%${marketSegment}%`);
  }

  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    query = query.where((builder) => {
      builder
        .whereILike('company_name', term)
        .orWhereILike('trade_name', term)
        .orWhereILike('tax_id', term);
    });
  }

  const [countResult, rows] = await Promise.all([
    query.clone().count({ total: '*' }).first(),
    query.clone().orderBy('created_at', 'desc').limit(limit).offset(offset),
  ]);

  const total = parseInt(countResult.total, 10);

  return {
    data: rows.map(normalize),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// --------------------------------------------------------------------------
// findById
// --------------------------------------------------------------------------

/**
 * Busca cliente por ID.
 *
 * @param {string} id
 * @returns {Promise<object>}
 */
async function findById(id) {
  const client = await db(TABLE_NAME)
    .where({ id, is_active: true })
    .first();

  if (!client) {
    throw new AppError('Cliente não encontrado.', 404);
  }

  return normalize(client);
}

// --------------------------------------------------------------------------
// create
// --------------------------------------------------------------------------

/**
 * Cria um novo cliente.
 *
 * @param {object} data - Dados validados pelo CreateClientSchema
 * @param {string} createdBy - UUID do usuário autenticado
 * @returns {Promise<object>} Cliente criado
 */
async function create(data, createdBy) {
  const id = uuidv4();

  await db(TABLE_NAME).insert({
    id,
    company_name: data.companyName,
    trade_name: data.tradeName || null,
    tax_id: data.taxId || null,
    company_size: data.companySize || null,
    industry_sector: data.industrySector || null,
    market_segment: data.marketSegment || null,
    website: data.website || null,
    address: data.address || null,
    city: data.city || null,
    state: data.state || null,
    country: data.country || DEFAULTS.country,
    zip_code: data.zipCode || null,
    business_contact_name: data.businessContactName || null,
    business_contact_email: data.businessContactEmail || null,
    business_contact_phone: data.businessContactPhone || null,
    technical_contact_name: data.technicalContactName || null,
    technical_contact_email: data.technicalContactEmail || null,
    technical_contact_phone: data.technicalContactPhone || null,
    business_objectives: data.businessObjectives || null,
    technical_constraints: data.technicalConstraints || null,
    // mysql2 + coluna JSON: pode passar o objeto diretamente
    stakeholders: JSON.stringify(data.stakeholders || []),
    status: data.status || DEFAULTS.status,
    relationship_start_date: data.relationshipStartDate || null,
    notes: data.notes || null,
    created_by: createdBy || null,
    is_active: true,
    created_at: db.fn.now(),
    updated_at: db.fn.now(),
  });

  return findById(id);
}

// --------------------------------------------------------------------------
// update
// --------------------------------------------------------------------------

/**
 * Atualiza parcialmente um cliente.
 *
 * @param {string} id
 * @param {object} data - Dados validados pelo UpdateClientSchema
 * @returns {Promise<object>} Cliente atualizado
 */
async function update(id, data) {
  const existing = await db(TABLE_NAME).where({ id, is_active: true }).first();

  if (!existing) {
    throw new AppError('Cliente não encontrado.', 404);
  }

  // Mapeia camelCase → snake_case para o banco
  const fieldMap = {
    companyName: 'company_name',
    tradeName: 'trade_name',
    taxId: 'tax_id',
    companySize: 'company_size',
    industrySector: 'industry_sector',
    marketSegment: 'market_segment',
    website: 'website',
    address: 'address',
    city: 'city',
    state: 'state',
    country: 'country',
    zipCode: 'zip_code',
    businessContactName: 'business_contact_name',
    businessContactEmail: 'business_contact_email',
    businessContactPhone: 'business_contact_phone',
    technicalContactName: 'technical_contact_name',
    technicalContactEmail: 'technical_contact_email',
    technicalContactPhone: 'technical_contact_phone',
    businessObjectives: 'business_objectives',
    technicalConstraints: 'technical_constraints',
    status: 'status',
    relationshipStartDate: 'relationship_start_date',
    notes: 'notes',
  };

  const updates = {};

  Object.entries(fieldMap).forEach(([camel, snake]) => {
    if (data[camel] !== undefined) {
      updates[snake] = data[camel];
    }
  });

  if (data.stakeholders !== undefined) {
    updates.stakeholders = JSON.stringify(data.stakeholders);
  }

  if (Object.keys(updates).length === 0) {
    throw new AppError('Nenhum campo válido para atualização.', 400);
  }

  updates.updated_at = db.fn.now();

  await db(TABLE_NAME).where({ id }).update(updates);

  return findById(id);
}

// --------------------------------------------------------------------------
// remove (soft delete)
// --------------------------------------------------------------------------

/**
 * Desativa um cliente (soft delete).
 *
 * @param {string} id
 */
async function remove(id) {
  const existing = await db(TABLE_NAME).where({ id, is_active: true }).first();

  if (!existing) {
    throw new AppError('Cliente não encontrado.', 404);
  }

  await db(TABLE_NAME).where({ id }).update({
    is_active: false,
    updated_at: db.fn.now(),
  });
}

module.exports = { list, findById, create, update, remove };
