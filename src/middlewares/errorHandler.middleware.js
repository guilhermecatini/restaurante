'use strict';

/**
 * Error handler centralizado.
 *
 * Captura todos os erros lançados ou passados via next(err) na aplicação
 * e retorna uma resposta JSON padronizada.
 *
 * Padrão de resposta de erro:
 * {
 *   "success": false,
 *   "message": "Mensagem legível pelo usuário",
 *   "errors": [...],          // opcional — lista de erros de validação
 *   "stack": "..."            // apenas em NODE_ENV=development
 * }
 */

const env = require('../config/env');

/**
 * Classe base para erros operacionais da aplicação.
 * Permite distinguir erros esperados (operacionais) de bugs (programação).
 */
class AppError extends Error {
  /**
   * @param {string} message - Mensagem legível
   * @param {number} [statusCode=500] - HTTP status code
   * @param {Array} [errors=[]] - Lista de erros de validação
   */
  constructor(message, statusCode = 500, errors = []) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Middleware de tratamento de erros do Express.
 * Deve ser registrado APÓS todas as rotas.
 *
 * @type {import('express').ErrorRequestHandler}
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Log do erro no servidor (sempre)
  if (!err.isOperational || err.statusCode >= 500) {
    console.error('[errorHandler]', {
      method: req.method,
      url: req.originalUrl,
      error: err.message,
      stack: err.stack,
    });
  }

  // Determina status e mensagem
  const statusCode = err.statusCode || 500;
  const message = err.isOperational
    ? err.message
    : 'Erro interno do servidor. Tente novamente mais tarde.';

  const response = {
    success: false,
    message,
  };

  // Adiciona lista de erros de validação se presente
  if (err.errors && err.errors.length > 0) {
    response.errors = err.errors;
  }

  // Stack trace apenas em desenvolvimento para não vazar informações
  if (env.IS_DEVELOPMENT) {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
}

module.exports = errorHandler;
module.exports.AppError = AppError;
