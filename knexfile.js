'use strict';

/**
 * Knex Configuration File
 *
 * Carrega as variáveis de ambiente antes de exportar a config,
 * garantindo que knex CLI funcione mesmo sem um processo pai que já
 * tenha carregado o dotenv (ex: ao rodar `npm run migrate`).
 */
require('dotenv').config();

/** @type {import('knex').Knex.Config} */
const baseConfig = {
  client: 'mysql2',
  migrations: {
    directory: './migrations',
    tableName: 'knex_migrations',
    // Prefixo timestamp para ordenação correta
    extension: 'js',
  },
  seeds: {
    directory: './seeds',
  },
  // Converte automaticamente snake_case do banco para camelCase no JS
  postProcessResponse: (result) => {
    if (Array.isArray(result)) {
      return result.map(snakeToCamel);
    }
    if (result !== null && typeof result === 'object') {
      return snakeToCamel(result);
    }
    return result;
  },
  wrapIdentifier: (value, origImpl) => origImpl(camelToSnake(value)),
};

/**
 * Converte um objeto com chaves snake_case para camelCase (shallow).
 * Para queries que retornam objetos aninhados, considere uma solução recursiva.
 */
function snakeToCamel(obj) {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    return obj;
  }
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    acc[camelKey] = value;
    return acc;
  }, {});
}

/**
 * Converte identificadores camelCase para snake_case ao montar queries.
 * Preserva nomes que já estão em snake_case ou que são palavras simples.
 */
function camelToSnake(value) {
  return value.replace(/([A-Z])/g, '_$1').toLowerCase();
}

module.exports = {
  development: {
    ...baseConfig,
    connection: {
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'rest_api_db',
      charset: 'utf8mb4',
    },
    pool: {
      min: 2,
      max: 10,
    },
    debug: false,
  },

  test: {
    ...baseConfig,
    connection: {
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      // Banco de teste separado para não contaminar desenvolvimento
      database: process.env.DB_NAME ? `${process.env.DB_NAME}_test` : 'rest_api_db_test',
      charset: 'utf8mb4',
    },
    pool: { min: 1, max: 5 },
  },

  production: {
    ...baseConfig,
    connection: {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      charset: 'utf8mb4',
      // TLS recomendado em produção — configure os certs conforme o ambiente
      // ssl: { rejectUnauthorized: true }
    },
    pool: {
      min: 2,
      max: 20,
    },
    // Desabilita debug em produção
    debug: false,
  },
};
