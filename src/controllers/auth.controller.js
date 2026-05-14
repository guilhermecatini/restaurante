'use strict';

/**
 * Controller de Autenticação.
 *
 * Orquestra o fluxo HTTP: extrai dados da request, delega ao service,
 * e monta a resposta. Não contém lógica de negócio.
 */

const passport = require('../config/passport');
const authService = require('../services/auth.service');
const env = require('../config/env');

// --------------------------------------------------------------------------
// POST /api/auth/register
// --------------------------------------------------------------------------

/**
 * Registra um novo usuário local e retorna access + refresh tokens.
 */
async function register(req, res, next) {
  try {
    const result = await authService.register(req.body);

    return res.status(201).json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    });
  } catch (err) {
    return next(err);
  }
}

// --------------------------------------------------------------------------
// POST /api/auth/login
// --------------------------------------------------------------------------

/**
 * Autentica o usuário via strategy Local do Passport e retorna tokens.
 */
async function login(req, res, next) {
  // Usa o Passport para autenticar — callback customizado para controle total da resposta
  passport.authenticate('local', { session: false }, async (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: info?.message || 'Credenciais inválidas.',
      });
    }

    try {
      const result = await authService.login(user);
      return res.json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
      });
    } catch (loginErr) {
      return next(loginErr);
    }
  })(req, res, next);
}

// --------------------------------------------------------------------------
// GET /api/auth/google
// --------------------------------------------------------------------------

/**
 * Inicia o fluxo OAuth com o Google.
 * O usuário é redirecionado para a tela de consentimento do Google.
 */
const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false,
});

// --------------------------------------------------------------------------
// GET /api/auth/google/callback
// --------------------------------------------------------------------------

/**
 * Callback após autenticação Google.
 * Redireciona o usuário para o frontend com o token no query param.
 */
async function googleCallback(req, res, next) {
  passport.authenticate('google', { session: false }, async (err, user) => {
    if (err || !user) {
      const message = err?.message || 'Falha na autenticação com o Google.';
      return res.redirect(`${env.FRONTEND_URL}/auth/error?message=${encodeURIComponent(message)}`);
    }

    try {
      const { accessToken, refreshToken } = await authService.loginOAuth(user);
      // Redireciona para o front-end com os tokens como query params
      // Em produção, prefira fragmentos (#) ou cookies httpOnly para não expor no histórico
      return res.redirect(
        `${env.FRONTEND_URL}/auth/callback?access_token=${accessToken}&refresh_token=${refreshToken}`
      );
    } catch (callbackErr) {
      return next(callbackErr);
    }
  })(req, res, next);
}

// --------------------------------------------------------------------------
// GET /api/auth/microsoft
// --------------------------------------------------------------------------

/**
 * Inicia o fluxo OAuth com a Microsoft.
 */
const microsoftAuth = passport.authenticate('microsoft', {
  session: false,
});

// --------------------------------------------------------------------------
// GET /api/auth/microsoft/callback
// --------------------------------------------------------------------------

/**
 * Callback após autenticação Microsoft.
 */
async function microsoftCallback(req, res, next) {
  passport.authenticate('microsoft', { session: false }, async (err, user) => {
    if (err || !user) {
      const message = err?.message || 'Falha na autenticação com a Microsoft.';
      return res.redirect(`${env.FRONTEND_URL}/auth/error?message=${encodeURIComponent(message)}`);
    }

    try {
      const { accessToken, refreshToken } = await authService.loginOAuth(user);
      return res.redirect(
        `${env.FRONTEND_URL}/auth/callback?access_token=${accessToken}&refresh_token=${refreshToken}`
      );
    } catch (callbackErr) {
      return next(callbackErr);
    }
  })(req, res, next);
}

// --------------------------------------------------------------------------
// POST /api/auth/refresh
// --------------------------------------------------------------------------

/**
 * Renova o access token usando um refresh token válido.
 */
async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshAccessToken(refreshToken);

    return res.json({
      success: true,
      data: { accessToken: result.accessToken },
    });
  } catch (err) {
    return next(err);
  }
}

// --------------------------------------------------------------------------
// POST /api/auth/logout
// --------------------------------------------------------------------------

/**
 * Invalida o refresh token do usuário.
 */
async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await authService.logout(refreshToken);
    }

    return res.json({
      success: true,
      data: { message: 'Logout realizado com sucesso.' },
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  register,
  login,
  googleAuth,
  googleCallback,
  microsoftAuth,
  microsoftCallback,
  refresh,
  logout,
};
