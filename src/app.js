'use strict';

/**
 * Fábrica da aplicação Express.
 *
 * Separa a criação do app da inicialização do servidor (server.js),
 * facilitando testes de integração que importam o app sem abrir porta.
 */

const fs = require('fs');
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const passport = require('./config/passport');

const env = require('./config/env');
const routes = require('./routes');
const swaggerSpec = require('./config/swagger');
const errorHandler = require('./middlewares/errorHandler.middleware');
const requestLogger = require('./middlewares/requestLogger.middleware');

const app = express();

// --------------------------------------------------------------------------
// Segurança — headers HTTP defensivos
// --------------------------------------------------------------------------
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          'https://cdn.jsdelivr.net',
          'https://ajax.googleapis.com',
          'https://unpkg.com',
          'https://cdnjs.cloudflare.com',
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          'https://cdn.jsdelivr.net',
          'https://cdnjs.cloudflare.com',
        ],
        fontSrc: ["'self'", 'data:', 'https://cdnjs.cloudflare.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: [
          "'self'",
          'https://cdn.jsdelivr.net',
          'https://ajax.googleapis.com',
          'https://unpkg.com',
          'https://cdnjs.cloudflare.com',
        ],
      },
    },
  })
);

// --------------------------------------------------------------------------
// CORS
// --------------------------------------------------------------------------
app.use(
  cors({
    origin: (origin, callback) => {
      // Permite requests sem origin (ex: Postman, curl) em desenvolvimento
      if (!origin && env.IS_DEVELOPMENT) return callback(null, true);
      if (env.CORS_ORIGINS.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS: origem não permitida — ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// --------------------------------------------------------------------------
// Body parsers
// --------------------------------------------------------------------------
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// --------------------------------------------------------------------------
// Passport (inicialização sem sessão HTTP)
// --------------------------------------------------------------------------
app.use(passport.initialize());

// --------------------------------------------------------------------------
// Request logger
// --------------------------------------------------------------------------
app.use(requestLogger);

// --------------------------------------------------------------------------
// Swagger UI — disponivel apenas fora de producao
// GET /api/docs       -> interface visual
// GET /api/docs.json  -> spec OpenAPI em JSON puro
// --------------------------------------------------------------------------
if (!env.IS_PRODUCTION) {
  app.use(
    '/api/docs',
    // O helmet bloqueia inline scripts por padrao — desabilita CSP apenas para a rota do Swagger
    (req, res, next) => {
      res.removeHeader('Content-Security-Policy');
      next();
    },
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: 'REST API Docs',
      swaggerOptions: {
        persistAuthorization: true, // mantem o token preenchido ao recarregar a pagina
      },
    })
  );

  app.get('/api/docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.info('[swagger] Documentacao disponivel em http://localhost:' + env.PORT + '/api/docs');
}

// --------------------------------------------------------------------------
// Rotas
// --------------------------------------------------------------------------
app.use('/api', routes);

// Rota de health-check
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
    },
  });
});

// --------------------------------------------------------------------------
// Frontend Angular — serve os arquivos estáticos se o build existir.
//
// A detecção é feita pela presença de public/frontend/index.html,
// gerado por "ng build" via angular.json (outputPath aponta aqui).
//
// Isso funciona independente de NODE_ENV:
//   - dev  → pasta não existe → Express ignora, Angular roda em :4200
//   - prod → pasta existe     → Express serve os estáticos + SPA fallback
// --------------------------------------------------------------------------
const frontendDist = path.join(__dirname, '../public/frontend');
const frontendIndex = path.join(frontendDist, 'index.html');

if (fs.existsSync(frontendIndex)) {
  // Arquivos estáticos (JS, CSS, imagens, fontes…)
  app.use(express.static(frontendDist));

  // Catch-all SPA — qualquer rota que não seja /api cai no index.html
  app.get(/^(?!\/api(?:\/|$)).*/, (_req, res) => {
    res.sendFile(frontendIndex);
  });

  console.info('[frontend] Servindo Angular em ' + frontendDist);
}

// --------------------------------------------------------------------------
// 404 — rotas não encontradas (API em qualquer ambiente; outras em dev)
// --------------------------------------------------------------------------
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada.',
  });
});

// --------------------------------------------------------------------------
// Error handler centralizado — deve ser o ÚLTIMO middleware
// --------------------------------------------------------------------------
app.use(errorHandler);

module.exports = app;
