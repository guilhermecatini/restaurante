'use strict';

/**
 * Rotas de autenticação — /api/v1/auth
 *
 * POST   /register              → criar conta
 * POST   /login                 → login com email + senha
 * POST   /refresh               → renovar access token
 * POST   /logout                → revogar refresh token
 * POST   /forgot-password       → solicitar reset de senha
 * POST   /reset-password        → definir nova senha com token
 * POST   /verify-email          → verificar e-mail com token
 * POST   /change-password       → trocar senha (autenticado)
 * GET    /me                    → retorna o usuário autenticado
 */

const { Router } = require('express');
const { validate } = require('../../middlewares/validate.middleware');
const { authenticateJWT } = require('../../middlewares/auth.v1.middleware');
const { authRateLimiter } = require('../../middlewares/rateLimiter.middleware');
const authController = require('../../controllers/v1/auth.controller');

const {
  RegisterSchema,
  LoginSchema,
  RefreshTokenSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  VerifyEmailSchema,
  ChangePasswordSchema,
} = require('../../validations/v1/auth.validation');

const router = Router();

// Rate limiting em todas as rotas de auth
router.use(authRateLimiter);

// --------------------------------------------------------------------------
// Públicas (sem JWT)
// --------------------------------------------------------------------------

/**
 * POST /api/v1/auth/register
 * Cria nova conta de cliente.
 * Retorna tokens de acesso imediatamente após o registro.
 */
router.post(
  '/register',
  validate(RegisterSchema),
  authController.register
);

/**
 * POST /api/v1/auth/login
 * Autentica com email + senha.
 * Retorna access token (15 min) + refresh token (7 dias).
 */
router.post(
  '/login',
  validate(LoginSchema),
  authController.login
);

/**
 * POST /api/v1/auth/refresh
 * Renova o access token usando um refresh token válido.
 */
router.post(
  '/refresh',
  validate(RefreshTokenSchema),
  authController.refresh
);

/**
 * POST /api/v1/auth/forgot-password
 * Envia e-mail com link/token de redefinição de senha.
 */
router.post(
  '/forgot-password',
  validate(ForgotPasswordSchema),
  authController.forgotPassword
);

/**
 * POST /api/v1/auth/reset-password
 * Redefine a senha usando o token recebido por e-mail.
 */
router.post(
  '/reset-password',
  validate(ResetPasswordSchema),
  authController.resetPassword
);

/**
 * POST /api/v1/auth/verify-email
 * Confirma o e-mail do usuário usando token enviado por e-mail.
 */
router.post(
  '/verify-email',
  validate(VerifyEmailSchema),
  authController.verifyEmail
);

// --------------------------------------------------------------------------
// Autenticadas (requerem JWT)
// --------------------------------------------------------------------------

/**
 * GET /api/v1/auth/me
 * Retorna dados do usuário autenticado.
 */
router.get(
  '/me',
  authenticateJWT,
  authController.me
);

/**
 * POST /api/v1/auth/change-password
 * Troca a senha do usuário autenticado.
 */
router.post(
  '/change-password',
  authenticateJWT,
  validate(ChangePasswordSchema),
  authController.changePassword
);

/**
 * POST /api/v1/auth/logout
 * Revoga o refresh token do usuário autenticado.
 */
router.post(
  '/logout',
  authenticateJWT,
  validate(RefreshTokenSchema),
  authController.logout
);

module.exports = router;
