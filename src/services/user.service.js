'use strict';

/**
 * Service de Usuarios.
 *
 * Logica de negocio para operacoes CRUD de usuarios:
 *  - Listagem paginada com busca
 *  - Busca por ID
 *  - Criacao (registro direto - sem fluxo OAuth)
 *  - Atualizacao parcial
 *  - Soft delete
 */

const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const env = require('../config/env');
const { db } = require('../config/database');
const { TABLE_NAME } = require('../models/user.model');
const { AppError } = require('../middlewares/errorHandler.middleware');

// --------------------------------------------------------------------------
// Campos selecionados por padrao (exclui password_hash)
// --------------------------------------------------------------------------
const DEFAULT_SELECT = [
  'id',
  'first_name',
  'last_name',
  'birth_date',
  'email',
  'phone',
  'provider',
  'is_active',
  'created_at',
  'updated_at',
];

// --------------------------------------------------------------------------
// list
// --------------------------------------------------------------------------

/**
 * Lista usuarios com paginacao e busca opcional por nome/email.
 *
 * @param {{ page: number, limit: number, search?: string }} params
 * @returns {Promise<{ data: object[], pagination: object }>}
 */
async function list({ page = 1, limit = 10, search }) {
  const offset = (page - 1) * limit;

  let query = db(TABLE_NAME)
    .where({ is_active: true })
    .select(DEFAULT_SELECT);

  if (search && search.trim()) {
    const term = '%' + search.trim() + '%';
    query = query.where(function () {
      this.whereILike('first_name', term)
        .orWhereILike('last_name', term)
        .orWhereILike('email', term);
    });
  }

  const [countResult, data] = await Promise.all([
    query.clone().count({ total: '*' }).first(),
    query.clone().orderBy('created_at', 'desc').limit(limit).offset(offset),
  ]);

  const total = parseInt(countResult.total, 10);

  return {
    data,
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
 * Busca usuario por ID.
 *
 * @param {string} id - UUID do usuario
 * @returns {Promise<object>}
 */
async function findById(id) {
  const user = await db(TABLE_NAME)
    .where({ id, is_active: true })
    .select(DEFAULT_SELECT)
    .first();

  if (!user) {
    throw new AppError('Usuario nao encontrado.', 404);
  }

  return user;
}

// --------------------------------------------------------------------------
// create
// --------------------------------------------------------------------------

/**
 * Cria um novo usuario local.
 *
 * @param {object} data - Dados validados pelo CreateUserSchema
 * @returns {Promise<object>} Usuario criado (sem password_hash)
 */
async function create(data) {
  const { firstName, lastName, birthDate, email, phone, password } = data;

  const existing = await db(TABLE_NAME).where({ email }).first();
  if (existing) {
    throw new AppError('Este e-mail ja esta cadastrado.', 409);
  }

  const passwordHash = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
  const id = uuidv4();

  await db(TABLE_NAME).insert({
    id,
    first_name: firstName,
    last_name: lastName,
    birth_date: birthDate,
    email,
    phone: phone || null,
    password_hash: passwordHash,
    provider: 'local',
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
 * Atualiza parcialmente um usuario.
 *
 * @param {string} id - UUID do usuario
 * @param {object} data - Dados validados pelo UpdateUserSchema
 * @returns {Promise<object>} Usuario atualizado
 */
async function update(id, data) {
  const user = await db(TABLE_NAME).where({ id, is_active: true }).first();

  if (!user) {
    throw new AppError('Usuario nao encontrado.', 404);
  }

  const updates = {};

  if (data.firstName !== undefined) updates.first_name = data.firstName;
  if (data.lastName !== undefined) updates.last_name = data.lastName;
  if (data.birthDate !== undefined) updates.birth_date = data.birthDate;
  if (data.phone !== undefined) updates.phone = data.phone;

  // Atualizacao de senha apenas para usuarios locais
  if (data.password !== undefined) {
    if (user.provider !== 'local') {
      throw new AppError('Usuarios OAuth nao podem definir senha local.', 400);
    }
    updates.password_hash = await bcrypt.hash(data.password, env.BCRYPT_SALT_ROUNDS);
  }

  if (Object.keys(updates).length === 0) {
    throw new AppError('Nenhum campo valido para atualizacao.', 400);
  }

  updates.updated_at = db.fn.now();

  await db(TABLE_NAME).where({ id }).update(updates);

  return findById(id);
}

// --------------------------------------------------------------------------
// remove (soft delete)
// --------------------------------------------------------------------------

/**
 * Desativa um usuario (soft delete - sets is_active = false).
 *
 * @param {string} id - UUID do usuario
 */
async function remove(id) {
  const user = await db(TABLE_NAME).where({ id, is_active: true }).first();

  if (!user) {
    throw new AppError('Usuario nao encontrado.', 404);
  }

  await db(TABLE_NAME).where({ id }).update({
    is_active: false,
    updated_at: db.fn.now(),
  });
}

module.exports = { list, findById, create, update, remove };
