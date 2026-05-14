'use strict';

/**
 * Módulo de configuração de variáveis de ambiente.
 *
 * Centraliza o acesso às env vars, aplica valores padrão seguros
 * e valida as obrigatórias na inicialização da aplicação.
 * Assim, qualquer ausência de variável crítica é detectada ANTES
 * de o servidor aceitar conexões.
 */

require('dotenv').config();

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

/**
 * Lê uma variável de ambiente obrigatória.
 * Lança exceção em tempo de boot se não estiver definida.
 */
function required(key) {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    throw new Error(`[env] Variável de ambiente obrigatória não definida: ${key}`);
  }
  return value.trim();
}

/**
 * Lê uma variável opcional, retornando o defaultValue se ausente.
 */
function optional(key, defaultValue = '') {
  return (process.env[key] || defaultValue).trim();
}

// --------------------------------------------------------------------------
// Objeto de configuração exportado
// --------------------------------------------------------------------------

const env = {
  // Servidor
  PORT: parseInt(optional('PORT', '3000'), 10),
  NODE_ENV: optional('NODE_ENV', 'development'),
  IS_PRODUCTION: optional('NODE_ENV', 'development') === 'production',
  IS_DEVELOPMENT: optional('NODE_ENV', 'development') === 'development',

  // Banco de dados
  DB: {
    HOST: optional('DB_HOST', '127.0.0.1'),
    PORT: parseInt(optional('DB_PORT', '3306'), 10),
    USER: optional('DB_USER', 'root'),
    PASS: optional('DB_PASS', ''),
    NAME: optional('DB_NAME', 'rest_api_db'),
  },

  // JWT
  JWT: {
    SECRET: required('JWT_SECRET'),
    REFRESH_SECRET: required('JWT_REFRESH_SECRET'),
    ACCESS_EXPIRES_IN: optional('JWT_ACCESS_EXPIRES_IN', '15m'),
    REFRESH_EXPIRES_IN: optional('JWT_REFRESH_EXPIRES_IN', '7d'),
  },

  // Google OAuth
  GOOGLE: {
    CLIENT_ID: optional('GOOGLE_CLIENT_ID'),
    CLIENT_SECRET: optional('GOOGLE_CLIENT_SECRET'),
    CALLBACK_URL: optional('GOOGLE_CALLBACK_URL', 'http://localhost:3000/api/auth/google/callback'),
  },

  // Microsoft OAuth
  MICROSOFT: {
    CLIENT_ID: optional('MICROSOFT_CLIENT_ID'),
    CLIENT_SECRET: optional('MICROSOFT_CLIENT_SECRET'),
    CALLBACK_URL: optional('MICROSOFT_CALLBACK_URL', 'http://localhost:3000/api/auth/microsoft/callback'),
  },

  // Bcrypt
  BCRYPT_SALT_ROUNDS: parseInt(optional('BCRYPT_SALT_ROUNDS', '12'), 10),

  // CORS
  CORS_ORIGINS: optional('CORS_ORIGINS', 'http://localhost:3000,http://localhost:5173')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),

  // Frontend URL para redirecionamento pós-OAuth
  FRONTEND_URL: optional('FRONTEND_URL', 'http://localhost:5173'),
};

module.exports = env;
