'use strict';

/**
 * Hierarquia de erros operacionais da aplicação.
 *
 * AppError é a classe base. Subclasses especializam o status HTTP
 * e permitem identificação semântica nos catch blocks.
 *
 * Uso:
 *   throw new NotFoundError('Pedido não encontrado.');
 *   throw new ForbiddenError();
 *   throw new ValidationError('Dados inválidos.', [{ field: 'email', message: '...' }]);
 */

class AppError extends Error {
  /**
   * @param {string} message        - Mensagem legível pelo usuário
   * @param {number} [statusCode=500]
   * @param {Array}  [errors=[]]    - Erros de validação no formato [{ field, message }]
   */
  constructor(message, statusCode = 500, errors = []) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// --------------------------------------------------------------------------
// Subclasses semânticas
// --------------------------------------------------------------------------

class BadRequestError extends AppError {
  constructor(message = 'Requisição inválida.', errors = []) {
    super(message, 400, errors);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Autenticação necessária.') {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Acesso não autorizado.') {
    super(message, 403);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Recurso não encontrado.') {
    super(message, 404);
  }
}

class ConflictError extends AppError {
  constructor(message = 'Conflito com o estado atual do recurso.') {
    super(message, 409);
  }
}

class UnprocessableError extends AppError {
  constructor(message = 'Dados de entrada inválidos.', errors = []) {
    super(message, 422, errors);
  }
}

class TooManyRequestsError extends AppError {
  constructor(message = 'Muitas tentativas. Aguarde antes de tentar novamente.') {
    super(message, 429);
  }
}

class InternalServerError extends AppError {
  constructor(message = 'Erro interno do servidor.') {
    super(message, 500);
  }
}

module.exports = {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  UnprocessableError,
  TooManyRequestsError,
  InternalServerError,
};
