'use strict';

/**
 * Controller de autenticação v1.
 * Lida com registro, login, tokens, recuperação de senha e verificação de e-mail.
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { db } = require('../../config/database');
const env = require('../../config/env');
const { ok, created } = require('../../shared/response');
const {
  ConflictError,
  UnauthorizedError,
  BadRequestError,
  NotFoundError,
} = require('../../errors/AppError');

const BCRYPT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRES = env.JWT.ACCESS_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRES = env.JWT.REFRESH_EXPIRES_IN || '7d';
const REFRESH_DAYS = 7;

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

function signAccessToken(userId) {
  return jwt.sign({ sub: userId }, env.JWT.SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES });
}

function signRefreshToken(userId) {
  return jwt.sign({ sub: userId }, env.JWT.REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES });
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// --------------------------------------------------------------------------
// Handlers
// --------------------------------------------------------------------------

async function register(req, res, next) {
  try {
    const { first_name, last_name, email, password, phone, birth_date } = req.body;

    const existing = await db('users').where({ email }).whereNull('deleted_at').first();
    if (existing) throw new ConflictError('E-mail já cadastrado.');

    const password_hash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const [userId] = await db('users').insert({
      first_name,
      last_name,
      email,
      phone: phone || null,
      birth_date: birth_date || null,
      user_type: 'customer',
      status: 'active',
    });

    await db('user_auth_providers').insert({
      user_id: userId,
      provider: 'local',
      password_hash,
      is_primary: true,
    });

    const accessToken = signAccessToken(userId);
    const refreshToken = signRefreshToken(userId);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_DAYS);

    await db('refresh_tokens').insert({
      user_id: userId,
      token_hash: hashToken(refreshToken),
      ip_address: req.ip,
      user_agent: req.headers['user-agent'] || null,
      expires_at: expiresAt,
    });

    return created(res, {
      message: 'Conta criada com sucesso.',
      data: { access_token: accessToken, refresh_token: refreshToken },
    });
  } catch (err) {
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await db('users')
      .where({ email })
      .whereNull('deleted_at')
      .select('id', 'first_name', 'last_name', 'email', 'user_type', 'status')
      .first();

    if (!user) throw new UnauthorizedError('Credenciais inválidas.');
    if (user.status !== 'active') throw new UnauthorizedError('Conta inativa ou bloqueada.');

    const authProvider = await db('user_auth_providers')
      .where({ user_id: user.id, provider: 'local' })
      .whereNull('deleted_at')
      .select('password_hash')
      .first();

    if (!authProvider?.password_hash) throw new UnauthorizedError('Credenciais inválidas.');

    const match = await bcrypt.compare(password, authProvider.password_hash);
    if (!match) throw new UnauthorizedError('Credenciais inválidas.');

    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_DAYS);

    await db('refresh_tokens').insert({
      user_id: user.id,
      token_hash: hashToken(refreshToken),
      ip_address: req.ip,
      user_agent: req.headers['user-agent'] || null,
      expires_at: expiresAt,
    });

    await db('users').where({ id: user.id }).update({ last_login_at: new Date() });

    return ok(res, {
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: { id: user.id, first_name: user.first_name, email: user.email, user_type: user.user_type },
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const { refresh_token } = req.body;

    let payload;
    try {
      payload = jwt.verify(refresh_token, env.JWT.REFRESH_SECRET);
    } catch {
      throw new UnauthorizedError('Refresh token inválido ou expirado.');
    }

    const tokenRecord = await db('refresh_tokens')
      .where({ user_id: payload.sub, token_hash: hashToken(refresh_token) })
      .whereNull('revoked_at')
      .whereNull('deleted_at')
      .where('expires_at', '>', new Date())
      .first();

    if (!tokenRecord) throw new UnauthorizedError('Refresh token inválido ou revogado.');

    const newAccessToken = signAccessToken(payload.sub);

    return ok(res, { data: { access_token: newAccessToken } });
  } catch (err) {
    return next(err);
  }
}

async function logout(req, res, next) {
  try {
    const { refresh_token } = req.body;
    await db('refresh_tokens')
      .where({ user_id: req.user.id, token_hash: hashToken(refresh_token) })
      .update({ revoked_at: new Date() });

    return ok(res, { message: 'Sessão encerrada com sucesso.' });
  } catch (err) {
    return next(err);
  }
}

async function me(req, res) {
  return ok(res, { data: req.user });
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const user = await db('users').where({ email }).whereNull('deleted_at').first();

    // Resposta sempre igual para não vazar existência do e-mail
    if (!user) {
      return ok(res, { message: 'Se o e-mail existir, você receberá as instruções em breve.' });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h

    // Revoga tokens anteriores não utilizados
    await db('password_reset_tokens')
      .where({ user_id: user.id })
      .whereNull('used_at')
      .whereNull('deleted_at')
      .update({ deleted_at: new Date() });

    await db('password_reset_tokens').insert({
      user_id: user.id,
      token_hash: hashToken(rawToken),
      expires_at: expiresAt,
    });

    // TODO: disparar e-mail via queue/mailer com rawToken
    console.info(`[forgotPassword] Token gerado para user ${user.id} — envio de e-mail pendente`);

    return ok(res, { message: 'Se o e-mail existir, você receberá as instruções em breve.' });
  } catch (err) {
    return next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;

    const record = await db('password_reset_tokens')
      .where({ token_hash: hashToken(token) })
      .whereNull('used_at')
      .whereNull('deleted_at')
      .where('expires_at', '>', new Date())
      .first();

    if (!record) throw new BadRequestError('Token inválido ou expirado.');

    const password_hash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    await db('user_auth_providers')
      .where({ user_id: record.user_id, provider: 'local' })
      .update({ password_hash });

    await db('password_reset_tokens').where({ id: record.id }).update({ used_at: new Date() });

    // Revoga todos os refresh tokens ativos
    await db('refresh_tokens')
      .where({ user_id: record.user_id })
      .whereNull('revoked_at')
      .update({ revoked_at: new Date() });

    return ok(res, { message: 'Senha redefinida com sucesso.' });
  } catch (err) {
    return next(err);
  }
}

async function verifyEmail(req, res, next) {
  try {
    // TODO: implementar lógica de verificação de e-mail via token
    return ok(res, { message: 'E-mail verificado com sucesso.' });
  } catch (err) {
    return next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const { current_password, new_password } = req.body;

    const authProvider = await db('user_auth_providers')
      .where({ user_id: req.user.id, provider: 'local' })
      .whereNull('deleted_at')
      .first();

    if (!authProvider?.password_hash) throw new BadRequestError('Conta não possui senha local.');

    const match = await bcrypt.compare(current_password, authProvider.password_hash);
    if (!match) throw new UnauthorizedError('Senha atual incorreta.');

    const password_hash = await bcrypt.hash(new_password, BCRYPT_ROUNDS);
    await db('user_auth_providers')
      .where({ id: authProvider.id })
      .update({ password_hash });

    return ok(res, { message: 'Senha alterada com sucesso.' });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  me,
  forgotPassword,
  resetPassword,
  verifyEmail,
  changePassword,
};
