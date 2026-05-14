'use strict';

/**
 * Entry point do servidor.
 *
 * Responsabilidades:
 *  1. Carregar as variáveis de ambiente (via config/env.js)
 *  2. Testar a conexão com o banco de dados
 *  3. Iniciar o servidor HTTP na porta configurada
 *  4. Tratar sinais de encerramento gracioso (SIGTERM / SIGINT)
 */

const env = require('./config/env');
const { testConnection } = require('./config/database');
const app = require('./app');

// --------------------------------------------------------------------------
// Boot
// --------------------------------------------------------------------------
async function start() {
  // Testa a conexão com o banco antes de aceitar requisições
  await testConnection();

  const server = app.listen(env.PORT, () => {
    console.info(`[server] Ambiente : ${env.NODE_ENV}`);
    console.info(`[server] Porta    : ${env.PORT}`);
    console.info(`[server] Iniciado : ${new Date().toISOString()}`);
  });

  // ------------------------------------------------------------------------
  // Graceful Shutdown
  // Aguarda as conexões ativas terminarem antes de encerrar o processo.
  // ------------------------------------------------------------------------
  const shutdown = (signal) => {
    console.info(`[server] Sinal ${signal} recebido. Encerrando...`);
    server.close(() => {
      console.info('[server] Servidor encerrado com sucesso.');
      process.exit(0);
    });

    // Força o encerramento após 10 segundos caso haja conexões presas
    setTimeout(() => {
      console.error('[server] Timeout de shutdown — forçando encerramento.');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Captura rejeições de Promise não tratadas
  process.on('unhandledRejection', (reason) => {
    console.error('[server] UnhandledRejection:', reason);
  });

  process.on('uncaughtException', (err) => {
    console.error('[server] UncaughtException:', err);
    process.exit(1);
  });
}

start();
