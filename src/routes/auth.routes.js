'use strict';

const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const { validate } = require('../middlewares/validate.middleware');
const { authRateLimiter } = require('../middlewares/rateLimiter.middleware');
const { RegisterSchema, LoginSchema, RefreshTokenSchema } = require('../validations/auth.validation');

const router = Router();

router.use(authRateLimiter);

// ============================================================================
// POST /api/auth/register
// ============================================================================

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Registra novo usuario local
 *     description: Cria uma conta com email e senha. Retorna access token e refresh token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Usuario criado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthTokensResponse'
 *       409:
 *         description: E-mail ja cadastrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       422:
 *         $ref: '#/components/responses/UnprocessableEntity'
 */
router.post('/register', validate(RegisterSchema), authController.register);

// ============================================================================
// POST /api/auth/login
// ============================================================================

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login local (email + senha)
 *     description: Autentica com email e senha. Retorna access token (15 min) e refresh token (7 dias).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: admin@example.com
 *             password: Admin@123456
 *     responses:
 *       200:
 *         description: Login realizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthTokensResponse'
 *       401:
 *         description: Credenciais invalidas.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       422:
 *         $ref: '#/components/responses/UnprocessableEntity'
 */
router.post('/login', validate(LoginSchema), authController.login);

// ============================================================================
// GET /api/auth/google
// ============================================================================

/**
 * @swagger
 * /auth/google:
 *   get:
 *     tags: [Auth]
 *     summary: Inicia fluxo OAuth com Google
 *     description: >
 *       Redireciona o usuario para a tela de consentimento do Google.
 *       Apos autenticacao, o Google chama o callback e a API redireciona
 *       para FRONTEND_URL/auth/callback?access_token=...&refresh_token=...
 *     responses:
 *       302:
 *         description: Redirecionamento para o Google.
 */
router.get('/google', authController.googleAuth);

// ============================================================================
// GET /api/auth/google/callback
// ============================================================================

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     tags: [Auth]
 *     summary: Callback OAuth Google (chamado pelo Google)
 *     description: Endpoint interno chamado pelo Google apos autenticacao. Nao chamar diretamente.
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: Codigo de autorizacao retornado pelo Google.
 *     responses:
 *       302:
 *         description: Redireciona para o frontend com os tokens.
 */
router.get('/google/callback', authController.googleCallback);

// ============================================================================
// GET /api/auth/microsoft
// ============================================================================

/**
 * @swagger
 * /auth/microsoft:
 *   get:
 *     tags: [Auth]
 *     summary: Inicia fluxo OAuth com Microsoft
 *     description: >
 *       Redireciona o usuario para a tela de consentimento da Microsoft (Azure AD).
 *       Apos autenticacao, redireciona para FRONTEND_URL/auth/callback com os tokens.
 *     responses:
 *       302:
 *         description: Redirecionamento para a Microsoft.
 */
router.get('/microsoft', authController.microsoftAuth);

// ============================================================================
// GET /api/auth/microsoft/callback
// ============================================================================

/**
 * @swagger
 * /auth/microsoft/callback:
 *   get:
 *     tags: [Auth]
 *     summary: Callback OAuth Microsoft (chamado pela Microsoft)
 *     description: Endpoint interno chamado pela Microsoft apos autenticacao. Nao chamar diretamente.
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: Codigo de autorizacao retornado pela Microsoft.
 *     responses:
 *       302:
 *         description: Redireciona para o frontend com os tokens.
 */
router.get('/microsoft/callback', authController.microsoftCallback);

// ============================================================================
// POST /api/auth/refresh
// ============================================================================

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Renova o access token
 *     description: Gera um novo access token a partir de um refresh token valido e nao revogado.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenRequest'
 *     responses:
 *       200:
 *         description: Novo access token gerado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiJ9...
 *       401:
 *         description: Refresh token invalido ou expirado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       422:
 *         $ref: '#/components/responses/UnprocessableEntity'
 */
router.post('/refresh', validate(RefreshTokenSchema), authController.refresh);

// ============================================================================
// POST /api/auth/logout
// ============================================================================

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout — revoga o refresh token
 *     description: Invalida o refresh token no banco. O access token continua valido ate expirar (15 min).
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiJ9...
 *     responses:
 *       200:
 *         description: Logout realizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Logout realizado com sucesso.
 */
router.post('/logout', authController.logout);

module.exports = router;
