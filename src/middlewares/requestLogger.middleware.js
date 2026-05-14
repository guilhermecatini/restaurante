'use strict';

/**
 * Middleware de log de requisições.
 *
 * Usa o morgan em modo "dev" para development e "combined" para produção.
 * Em produção, o formato combined é compatível com ferramentas de análise
 * de log como Nginx, ELK Stack e CloudWatch.
 */

const morgan = require('morgan');
const env = require('../config/env');

// Morgan já adiciona o tempo de resposta no token :response-time
const format = env.IS_PRODUCTION ? 'combined' : 'dev';

const requestLogger = morgan(format, {
  // Skipa logs para health-check para não poluir os logs
  skip: (req) => req.url === '/health',
});

module.exports = requestLogger;
