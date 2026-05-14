'use strict';

/**
 * Utilitários de paginação para queries Knex.
 *
 * Padrão de query params:
 *   ?page=1&per_page=20&sort=created_at&order=desc
 */

const DEFAULT_PAGE = 1;
const DEFAULT_PER_PAGE = 20;
const MAX_PER_PAGE = 100;

/**
 * Extrai e normaliza os parâmetros de paginação do req.query.
 *
 * @param {import('express').Request} req
 * @returns {{ page: number, perPage: number, sort: string, order: 'asc'|'desc' }}
 */
function parsePagination(req, { defaultSort = 'created_at', allowedSorts = [] } = {}) {
  let page = parseInt(req.query.page, 10) || DEFAULT_PAGE;
  let perPage = parseInt(req.query.per_page, 10) || DEFAULT_PER_PAGE;
  const order = req.query.order === 'asc' ? 'asc' : 'desc';

  // Sanitização de segurança
  if (page < 1) page = DEFAULT_PAGE;
  if (perPage < 1) perPage = DEFAULT_PER_PAGE;
  if (perPage > MAX_PER_PAGE) perPage = MAX_PER_PAGE;

  let sort = req.query.sort || defaultSort;
  if (allowedSorts.length > 0 && !allowedSorts.includes(sort)) {
    sort = defaultSort;
  }

  return { page, perPage, sort, order };
}

/**
 * Aplica LIMIT e OFFSET em uma query Knex.
 *
 * @param {import('knex').Knex.QueryBuilder} query
 * @param {{ page: number, perPage: number }} pagination
 * @returns {import('knex').Knex.QueryBuilder}
 */
function applyPagination(query, { page, perPage }) {
  const offset = (page - 1) * perPage;
  return query.limit(perPage).offset(offset);
}

/**
 * Monta o objeto de metadados de paginação incluído na resposta.
 *
 * @param {number} total     - Total de registros
 * @param {number} page      - Página atual
 * @param {number} perPage   - Itens por página
 * @returns {object}
 */
function buildPaginationMeta(total, page, perPage) {
  const lastPage = Math.ceil(total / perPage) || 1;
  return {
    total,
    per_page: perPage,
    current_page: page,
    last_page: lastPage,
    from: total === 0 ? null : (page - 1) * perPage + 1,
    to: total === 0 ? null : Math.min(page * perPage, total),
  };
}

module.exports = { parsePagination, applyPagination, buildPaginationMeta };
