'use strict';

/**
 * Roteador raiz da API.
 *
 * Monta todas as sub-rotas sob o prefixo /api (definido no app.js).
 * Para adicionar novos módulos, basta registrar aqui.
 */

const { Router } = require('express');

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const clientRoutes = require('./client.routes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/clients', clientRoutes);

module.exports = router;
