'use strict';

/**
 * Rate limiting para rotas de autenticação.
 *
 * Evita ataques de brute-force e credential stuffing nas rotas de /api/auth.
 * Configuração atual: máximo de 20 requisições por IP a cada 15 minutos.
 *
 * Em ambientes com múltiplos processos/instâncias, substitua o store
 * padrão (memória) por RedisStore para compartilhar contadores entre instâncias.
 */

const rateLimit = require('express-rate-limit');
const env = require('../config/env');

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20,                   // máximo de requisições por janela
  standardHeaders: true,     // Retorna `RateLimit-*` headers (RFC 6585)
  legacyHeaders: false,      // Desabilita `X-RateLimit-*` headers depreciados
  message: {
    success: false,
    message: 'Muitas tentativas. Tente novamente em 15 minutos.',
  },
  // Em desenvolvimento, não aplica limite para facilitar testes
  skip: () => env.IS_DEVELOPMENT,
});

module.exports = { authRateLimiter };
