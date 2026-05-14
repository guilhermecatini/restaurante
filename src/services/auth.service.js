'use strict';

/**
 * Service de Autenticação.
 *
 * Contém toda a lógica de negócio relacionada a:
 *  - Registro de usuário local
 *  - Geração e renovação de tokens JWT
 *  - Revogação de refresh tokens (logout)
 *
 * Os controllers delegam para este service — nunca acessam o banco diretamente.
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const env = require('../config/env');
const { db } = require('../config/database');
const { sanitizeUser } = require('../models/user.model');
const { AppError } = require('../middlewares/errorHandler.middleware');

// --------------------------------------------------------------------------
// Helpers de Token
// --------------------------------------------------------------------------

/**
 * Gera um par access_token + refresh_token para o usuário.
 *
 * @param {object} user - Objeto do usuário (do banco)
 * @returns {{ accessToken: string, refreshToken: string }}
 */
function generateTokenPair(user) {
  const accessToken = jwt.sign(
    {
      sub: user.id,
      email: user.email,
      provider: user.provider,
    },
    env.JWT.SECRET,
    { expiresIn: env.JWT.ACCESS_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { sub: user.id },
    env.JWT.REFRESH_SECRET,
    { expiresIn: env.JWT.REFRESH_EXPIRES_IN }
  );

  return { accessToken, refreshToken };
}

/**
 * Persiste o refresh token no banco (tabela refresh_tokens).
 * Permite revogar tokens individualmente (logout) e detectar reutilização.
 *
 * @param {string} userId
 * @param {string} token - Valor do refresh token
 * @param {string} expiresIn - String de expiração (ex: '7d')
 */
async function storeRefreshToken(userId, token, expiresIn) {
  // Converte "7d" → ms → Date
  const expiresAt = new Date(Date.now() + parseDuration(expiresIn));

  await db('refresh_tokens').insert({
    id: uuidv4(),
    user_id: userId,
    token,
    expires_at: expiresAt,
    created_at: db.fn.now(),
  });
}

/**
 * Converte strings de duração JWT (ex: "15m", "7d") para milissegundos.
 */
function parseDuration(str) {
  const units = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  const match = str.match(/^(\d+)([smhd])$/);
  if (!match) throw new Error(`Formato de duração inválido: ${str}`);
  return parseInt(match[1], 10) * units[match[2]];
}

// --------------------------------------------------------------------------
// register
// --------------------------------------------------------------------------

/**
 * Registra um novo usuário local.
 *
 * @param {object} data - Dados validados pelo RegisterSchema
 * @returns {Promise<{ user: object, accessToken: string, refreshToken: string }>}
 */
async function register(data) {
  const { firstName, lastName, birthDate, email, phone, password } = data;

  // Verifica se e-mail já está em uso
  const existing = await db('users').where({ email }).first();
  if (existing) {
    throw new AppError('Este e-mail já está cadastrado.', 409);
  }

  const passwordHash = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
  const id = uuidv4();

  await db('users').insert({
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

  const user = await db('users').where({ id }).first();
  const { accessToken, refreshToken } = generateTokenPair(user);

  await storeRefreshToken(user.id, refreshToken, env.JWT.REFRESH_EXPIRES_IN);

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  };
}

// --------------------------------------------------------------------------
// login
// --------------------------------------------------------------------------

/**
 * Realiza o login após a validação pelo Passport (estratégia Local).
 * Recebe o objeto user já autenticado.
 *
 * @param {object} user - Usuário autenticado pelo Passport
 * @returns {Promise<{ user: object, accessToken: string, refreshToken: string }>}
 */
async function login(user) {
  const { accessToken, refreshToken } = generateTokenPair(user);
  await storeRefreshToken(user.id, refreshToken, env.JWT.REFRESH_EXPIRES_IN);

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  };
}

// --------------------------------------------------------------------------
// loginOAuth
// --------------------------------------------------------------------------

/**
 * Finaliza o fluxo OAuth (Google / Microsoft) gerando tokens JWT.
 * O Passport já realizou o upsert do usuário.
 *
 * @param {object} user - Usuário retornado pela strategy OAuth
 * @returns {Promise<{ accessToken: string, refreshToken: string }>}
 */
async function loginOAuth(user) {
  const { accessToken, refreshToken } = generateTokenPair(user);
  await storeRefreshToken(user.id, refreshToken, env.JWT.REFRESH_EXPIRES_IN);
  return { accessToken, refreshToken };
}

// --------------------------------------------------------------------------
// refreshAccessToken
// --------------------------------------------------------------------------

/**
 * Gera um novo access token a partir de um refresh token válido.
 *
 * @param {string} refreshToken
 * @returns {Promise<{ accessToken: string }>}
 */
async function refreshAccessToken(refreshToken) {
  // Verifica assinatura e expiração do JWT
  let payload;
  try {
    payload = jwt.verify(refreshToken, env.JWT.REFRESH_SECRET);
  } catch (err) {
    const message = err.name === 'TokenExpiredError'
      ? 'Refresh token expirado. Faça login novamente.'
      : 'Refresh token inválido.';
    throw new AppError(message, 401);
  }

  // Verifica se o token ainda existe no banco (não foi revogado)
  const storedToken = await db('refresh_tokens')
    .where({ token: refreshToken, user_id: payload.sub })
    .where('expires_at', '>', db.fn.now())
    .first();

  if (!storedToken) {
    throw new AppError('Refresh token inválido ou já revogado.', 401);
  }

  // Busca o usuário
  const user = await db('users')
    .where({ id: payload.sub, is_active: true })
    .first();

  if (!user) {
    throw new AppError('Usuário não encontrado ou conta desativada.', 401);
  }

  const accessToken = jwt.sign(
    { sub: user.id, email: user.email, provider: user.provider },
    env.JWT.SECRET,
    { expiresIn: env.JWT.ACCESS_EXPIRES_IN }
  );

  return { accessToken };
}

// --------------------------------------------------------------------------
// logout
// --------------------------------------------------------------------------

/**
 * Revoga o refresh token, invalidando a sessão do usuário.
 *
 * @param {string} refreshToken
 */
async function logout(refreshToken) {
  await db('refresh_tokens').where({ token: refreshToken }).delete();
}

module.exports = { register, login, loginOAuth, refreshAccessToken, logout, generateTokenPair };
