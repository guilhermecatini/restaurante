'use strict';

/**
 * Middleware de validação de input com Zod.
 *
 * Recebe um schema Zod e valida req.body (ou req.query / req.params).
 * Retorna HTTP 422 com lista de erros legíveis em caso de falha.
 *
 * Por que Zod?
 *  - API declarativa e moderna com suporte nativo a TypeScript
 *  - Mensagens de erro mais informativas por padrão
 *  - Transformações e coerções integradas (ex: string → Date, string → number)
 *  - Parse seguro via safeParse() — não lança exceções inesperadas
 *  - Ecossistema ativo e amplamente adotado (Next.js, tRPC, etc.)
 *
 * Uso:
 *   router.post('/rota', validate(MeuSchema), controller.metodo);
 *   router.get('/rota', validate(FiltroSchema, 'query'), controller.metodo);
 */

const { ZodError } = require('zod');

/**
 * Formata os erros do Zod em um array legível por humanos e por front-ends.
 *
 * @param {ZodError} zodError
 * @returns {Array<{ field: string, message: string }>}
 */
function formatZodErrors(zodError) {
  return zodError.errors.map((err) => ({
    field: err.path.join('.') || 'root',
    message: err.message,
  }));
}

/**
 * Middleware factory de validação.
 *
 * @param {import('zod').ZodSchema} schema - Schema Zod para validação
 * @param {'body'|'query'|'params'} [source='body'] - Parte da request a validar
 * @returns {import('express').RequestHandler}
 */
function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return res.status(422).json({
        success: false,
        message: 'Dados de entrada inválidos.',
        errors: formatZodErrors(result.error),
      });
    }

    // Substitui o objeto original pelo dado já parseado/transformado pelo Zod
    // (garante coerções, defaults e strips de campos extras)
    req[source] = result.data;

    return next();
  };
}

module.exports = { validate, formatZodErrors };
