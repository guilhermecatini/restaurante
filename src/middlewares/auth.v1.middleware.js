'use strict';

/**
 * Middleware de autenticação para /api/v1.
 *
 * Adaptado ao novo schema de banco (users v2):
 *  - status enum em vez de is_active boolean
 *  - user_type em vez de campo role inline
 *  - relação com restaurant_users para contexto de restaurante
 */

const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { db } = require('../config/database');
const { UnauthorizedError } = require('../errors/AppError');

// --------------------------------------------------------------------------
// Helpers internos
// --------------------------------------------------------------------------

function extractBearerToken(req) {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer ')) return null;
  return header.slice(7).trim() || null;
}

function verifyToken(token) {
  return jwt.verify(token, env.JWT.SECRET);
}

// --------------------------------------------------------------------------
// Middleware: authenticateJWT (v1)
// Popula req.user com dados completos incluindo user_type
// --------------------------------------------------------------------------
async function authenticateJWT(req, _res, next) {
  const token = extractBearerToken(req);

  if (!token) {
    return next(new UnauthorizedError('Token de autenticação não fornecido.'));
  }

  try {
    const payload = verifyToken(token);

    const user = await db('users')
      .where({ id: payload.sub })
      .whereIn('status', ['active'])
      .select('id', 'first_name', 'last_name', 'email', 'phone', 'user_type', 'status')
      .first();

    if (!user) {
      return next(new UnauthorizedError('Usuário não encontrado ou conta inativa.'));
    }

    // Compatibilidade: alguns módulos ainda leem req.user em snake_case
    user.first_name = user.first_name || user.firstName;
    user.last_name = user.last_name || user.lastName;
    user.user_type = user.user_type || user.userType;

    req.user = user;
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Token expirado. Renove sua sessão.'));
    }
    return next(new UnauthorizedError('Token inválido.'));
  }
}

// --------------------------------------------------------------------------
// Middleware: optionalJWT (v1)
// Não bloqueia — útil em rotas públicas que personalizam resposta p/ usuário logado
// --------------------------------------------------------------------------
async function optionalJWT(req, _res, next) {
  const token = extractBearerToken(req);

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const payload = verifyToken(token);
    const user = await db('users')
      .where({ id: payload.sub })
      .whereIn('status', ['active'])
      .select('id', 'first_name', 'last_name', 'email', 'user_type', 'status')
      .first();

    if (user) {
      user.first_name = user.first_name || user.firstName;
      user.last_name = user.last_name || user.lastName;
      user.user_type = user.user_type || user.userType;
    }
    req.user = user || null;
  } catch {
    req.user = null;
  }

  return next();
}

module.exports = { authenticateJWT, optionalJWT };
