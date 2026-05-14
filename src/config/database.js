'use strict';

/**
 * Instância singleton do Knex.
 *
 * Importa a configuração do knexfile.js de acordo com o NODE_ENV atual,
 * garantindo que toda a aplicação use a mesma pool de conexões.
 */

const knex = require('knex');
const knexConfig = require('../../knexfile');
const env = require('./env');

const environment = env.NODE_ENV || 'development';
const config = knexConfig[environment];

if (!config) {
  throw new Error(`[database] Configuração Knex não encontrada para o ambiente: "${environment}"`);
}

const db = knex(config);

/**
 * Testa a conectividade com o banco na inicialização.
 * Não bloqueia o boot, apenas loga o resultado.
 */
async function testConnection() {
  try {
    await db.raw('SELECT 1');
    console.info(`[database] Conexão estabelecida com sucesso (${environment})`);
  } catch (err) {
    console.error('[database] Falha ao conectar ao banco de dados:', err.message);
    // Em produção, pode ser desejável encerrar o processo aqui:
    // if (env.IS_PRODUCTION) process.exit(1);
  }
}

module.exports = { db, testConnection };
