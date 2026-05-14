'use strict';

/**
 * Middlewares de autenticação e autorização.
 *
 * authenticateJWT  : Valida Bearer token em rotas protegidas.
 * requireAdmin     : Garante que o usuário autenticado é admin (role = 'admin').
 * optionalJWT      : Popula req.user se token presente, mas não bloqueia a request.
 */

const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { db } = require('../config/database');

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

/**
 * Extrai o Bearer token do header Authorization.
 * Retorna null se não encontrado ou formato inválido.
 *
 * @param {import('express').Request} req
 * @returns {string|null}
 */
function extractBearerToken(req) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7).trim() || null;
}

/**
 * Verifica e decodifica o access token JWT.
 *
 * @param {string} token
 * @returns {object} Payload decodificado
 * @throws {Error} Se token inválido ou expirado
 */
function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT.SECRET);
}

// --------------------------------------------------------------------------
// Middleware: authenticateJWT
// --------------------------------------------------------------------------

/**
 * Valida o Bearer token e popula req.user com os dados do usuário.
 * Bloqueia a requisição com 401 se o token for inválido ou expirado.
 */
async function authenticateJWT(req, res, next) {
  const token = extractBearerToken(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token de autenticação não fornecido.',
    });
  }

  try {
    const payload = verifyAccessToken(token);

    // Busca o usuário no banco para garantir que ainda está ativo
    // (ex: conta desativada após emissão do token)
    const user = await db('users')
      .where({ id: payload.sub, is_active: true })
      .select('id', 'first_name', 'last_name', 'email', 'provider', 'is_active')
      .first();

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado ou conta desativada.',
      });
    }

    req.user = user;
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado. Faça login novamente ou utilize o refresh token.',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Token inválido.',
    });
  }
}

// --------------------------------------------------------------------------
// Middleware: optionalJWT
// --------------------------------------------------------------------------

/**
 * Tenta autenticar o usuário via JWT, mas não bloqueia se não houver token.
 * Útil para rotas que têm comportamento diferente para usuários autenticados.
 */
async function optionalJWT(req, _res, next) {
  const token = extractBearerToken(req);

  if (!token) {
    return next();
  }

  try {
    const payload = verifyAccessToken(token);
    const user = await db('users')
      .where({ id: payload.sub, is_active: true })
      .select('id', 'first_name', 'last_name', 'email', 'provider', 'is_active')
      .first();

    req.user = user || null;
  } catch (_err) {
    // Ignora erros — token inválido simplesmente não autentica
    req.user = null;
  }

  return next();
}

module.exports = { authenticateJWT, optionalJWT };
