'use strict';

/**
 * Formatação padronizada de respostas HTTP da API v1.
 *
 * Todas as respostas seguem o envelope:
 * {
 *   "success": true|false,
 *   "message": "Mensagem legível (opcional)",
 *   "data": { ... } | [ ... ],
 *   "meta": { pagination, ... }
 * }
 */

/**
 * Envia resposta de sucesso.
 *
 * @param {import('express').Response} res
 * @param {object}   opts
 * @param {any}      opts.data        - Payload da resposta
 * @param {string}   [opts.message]   - Mensagem opcional
 * @param {object}   [opts.meta]      - Metadados extras (paginação, etc.)
 * @param {number}   [opts.status=200]
 */
function ok(res, { data = null, message = null, meta = null, status = 200 } = {}) {
  const body = { success: true };
  if (message) body.message = message;
  if (data !== null) body.data = data;
  if (meta) body.meta = meta;
  return res.status(status).json(body);
}

/**
 * Envia resposta de criação (201).
 *
 * @param {import('express').Response} res
 * @param {object} opts - Mesmos parâmetros de ok()
 */
function created(res, opts = {}) {
  return ok(res, { ...opts, status: 201 });
}

/**
 * Envia resposta sem conteúdo (204).
 *
 * @param {import('express').Response} res
 */
function noContent(res) {
  return res.status(204).end();
}

/**
 * Envia resposta paginada.
 *
 * @param {import('express').Response} res
 * @param {Array}  items      - Array de itens da página atual
 * @param {object} pagination - Objeto de paginação vindo de buildPaginationMeta()
 * @param {string} [message]
 */
function paginated(res, items, pagination, message = null) {
  return ok(res, {
    data: items,
    meta: { pagination },
    message,
  });
}

module.exports = { ok, created, noContent, paginated };
