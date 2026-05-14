'use strict';

/**
 * Middleware de sanitização de entrada.
 *
 * Aplica defesas básicas contra XSS e injeção em strings recebidas
 * via req.body, req.query e req.params.
 *
 * IMPORTANTE: Não substitui validação via Zod. Deve ser usado em conjunto.
 */

/**
 * Sanitiza uma string removendo tags HTML e caracteres perigosos.
 *
 * @param {string} str
 * @returns {string}
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return str;

  return str
    // Remove tags HTML
    .replace(/<[^>]*>/g, '')
    // Remove null bytes
    .replace(/\0/g, '')
    // Trim
    .trim();
}

/**
 * Sanitiza recursivamente um objeto ou array.
 *
 * @param {any} value
 * @returns {any}
 */
function sanitizeDeep(value) {
  if (typeof value === 'string') return sanitizeString(value);

  if (Array.isArray(value)) {
    return value.map(sanitizeDeep);
  }

  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, sanitizeDeep(v)])
    );
  }

  return value;
}

/**
 * Middleware que sanitiza body, query e params da requisição.
 */
function sanitize(req, _res, next) {
  if (req.body) req.body = sanitizeDeep(req.body);
  if (req.query) req.query = sanitizeDeep(req.query);
  // params são lidos pelo router, sanitizamos só strings
  if (req.params) req.params = sanitizeDeep(req.params);
  return next();
}

module.exports = { sanitize, sanitizeString, sanitizeDeep };
