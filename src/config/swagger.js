'use strict';

/**
 * Configuracao do Swagger (OpenAPI 3.0)
 *
 * swagger-jsdoc le as anotacoes @swagger nos arquivos de rotas
 * e monta o spec completo em tempo de boot.
 *
 * A UI fica disponivel em: GET /api/docs
 * O spec JSON bruto em  : GET /api/docs.json
 */

const swaggerJsdoc = require('swagger-jsdoc');
const env = require('./env');

const options = {
  definition: {
    openapi: '3.0.0',

    info: {
      title: 'REST API Node.js',
      version: '1.0.0',
      description:
        'API REST com autenticacao JWT, OAuth 2.0 (Google e Microsoft), ' +
        'CRUD de usuarios e clientes, construida com Express + Knex + MariaDB.',
      contact: {
        name: 'Guilherme Catini',
        email: 'guilherme@catini.org',
      },
    },

    // Base da URL das rotas (sem o /api — ele ja esta no prefixo do app.js)
    servers: [
      {
        url: 'http://localhost:' + env.PORT + '/api',
        description: 'Servidor local (development)',
      },
    ],

    // --------------------------------------------------------------------------
    // Security global: todas as rotas protegidas usam Bearer JWT
    // --------------------------------------------------------------------------
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Informe o access_token obtido no login. Formato: Bearer <token>',
        },
      },

      // -----------------------------------------------------------------------
      // Schemas reutilizaveis
      // -----------------------------------------------------------------------
      schemas: {

        // --- Respostas padrao ---------------------------------------------------

        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Mensagem de erro legivel.' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string', example: 'email' },
                  message: { type: 'string', example: 'Formato de e-mail invalido.' },
                },
              },
            },
          },
        },

        PaginationMeta: {
          type: 'object',
          properties: {
            page:       { type: 'integer', example: 1 },
            limit:      { type: 'integer', example: 10 },
            total:      { type: 'integer', example: 102 },
            totalPages: { type: 'integer', example: 11 },
          },
        },

        // --- Auth --------------------------------------------------------------

        RegisterRequest: {
          type: 'object',
          required: ['firstName', 'lastName', 'birthDate', 'email', 'password', 'confirmPassword'],
          properties: {
            firstName:       { type: 'string', example: 'Guilherme' },
            lastName:        { type: 'string', example: 'Catini' },
            birthDate:       { type: 'string', format: 'date', example: '1985-06-15' },
            email:           { type: 'string', format: 'email', example: 'guilherme@catini.org' },
            phone:           { type: 'string', example: '+55 11 99999-0001' },
            password:        { type: 'string', format: 'password', minLength: 8, example: 'Senha@123' },
            confirmPassword: { type: 'string', format: 'password', example: 'Senha@123' },
          },
        },

        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email:    { type: 'string', format: 'email', example: 'admin@example.com' },
            password: { type: 'string', format: 'password', example: 'Admin@123456' },
          },
        },

        RefreshTokenRequest: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiJ9...' },
          },
        },

        AuthTokensResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                user:         { '$ref': '#/components/schemas/UserPublic' },
                accessToken:  { type: 'string', example: 'eyJhbGciOiJIUzI1NiJ9...' },
                refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiJ9...' },
              },
            },
          },
        },

        // --- Usuario -----------------------------------------------------------

        UserPublic: {
          type: 'object',
          properties: {
            id:        { type: 'string', format: 'uuid', example: '00000000-0000-0000-0000-000000000001' },
            firstName: { type: 'string', example: 'Guilherme' },
            lastName:  { type: 'string', example: 'Catini' },
            birthDate: { type: 'string', format: 'date', example: '1985-06-15' },
            email:     { type: 'string', format: 'email', example: 'guilherme@catini.org' },
            phone:     { type: 'string', example: '+55 11 99999-0001' },
            provider:  { type: 'string', enum: ['local', 'google', 'microsoft'], example: 'local' },
            isActive:  { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        CreateUserRequest: {
          type: 'object',
          required: ['firstName', 'lastName', 'birthDate', 'email', 'password'],
          properties: {
            firstName: { type: 'string', example: 'Joao' },
            lastName:  { type: 'string', example: 'Silva' },
            birthDate: { type: 'string', format: 'date', example: '1990-01-01' },
            email:     { type: 'string', format: 'email', example: 'joao@example.com' },
            phone:     { type: 'string', example: '+55 11 99999-0001' },
            password:  { type: 'string', format: 'password', minLength: 8, example: 'Senha@123' },
          },
        },

        UpdateUserRequest: {
          type: 'object',
          properties: {
            firstName: { type: 'string', example: 'Joao' },
            lastName:  { type: 'string', example: 'Silva' },
            birthDate: { type: 'string', format: 'date', example: '1990-01-01' },
            phone:     { type: 'string', example: '+55 11 99999-0002' },
            password:  { type: 'string', format: 'password', minLength: 8, example: 'NovaSenha@456' },
          },
        },

        // --- Cliente -----------------------------------------------------------

        Stakeholder: {
          type: 'object',
          required: ['name', 'role', 'email'],
          properties: {
            name:  { type: 'string', example: 'Rafael Costa' },
            role:  { type: 'string', example: 'Arquiteto de Solucoes' },
            email: { type: 'string', format: 'email', example: 'rafael@empresa.com' },
          },
        },

        ClientResponse: {
          type: 'object',
          properties: {
            id:                    { type: 'string', format: 'uuid' },
            companyName:           { type: 'string', example: 'Acme Tecnologia S/A' },
            tradeName:             { type: 'string', example: 'AcmeTech' },
            taxId:                 { type: 'string', example: '12.345.678/0001-99' },
            companySize:           { type: 'string', enum: ['micro', 'small', 'medium', 'large', 'enterprise'] },
            industrySector:        { type: 'string', example: 'Tecnologia da Informacao' },
            marketSegment:         { type: 'string', example: 'B2B SaaS' },
            website:               { type: 'string', example: 'https://acmetech.com.br' },
            address:               { type: 'string', example: 'Av. Paulista, 1234' },
            city:                  { type: 'string', example: 'Sao Paulo' },
            state:                 { type: 'string', example: 'SP' },
            country:               { type: 'string', example: 'Brasil' },
            zipCode:               { type: 'string', example: '01310-100' },
            businessContactName:   { type: 'string', example: 'Carla Ferreira' },
            businessContactEmail:  { type: 'string', format: 'email' },
            businessContactPhone:  { type: 'string', example: '+55 11 3000-0001' },
            technicalContactName:  { type: 'string', example: 'Rafael Costa' },
            technicalContactEmail: { type: 'string', format: 'email' },
            technicalContactPhone: { type: 'string', example: '+55 11 3000-0002' },
            businessObjectives:    { type: 'string', example: 'Modernizar sistema legado...' },
            technicalConstraints:  { type: 'string', example: 'Infraestrutura on-premise...' },
            stakeholders: {
              type: 'array',
              items: { '$ref': '#/components/schemas/Stakeholder' },
            },
            status:                { type: 'string', enum: ['active', 'prospect', 'closed'] },
            relationshipStartDate: { type: 'string', format: 'date', example: '2023-03-15' },
            notes:                 { type: 'string' },
            createdBy:             { type: 'string', format: 'uuid' },
            isActive:              { type: 'boolean' },
            createdAt:             { type: 'string', format: 'date-time' },
            updatedAt:             { type: 'string', format: 'date-time' },
          },
        },

        CreateClientRequest: {
          type: 'object',
          required: ['companyName'],
          properties: {
            companyName:           { type: 'string', example: 'Acme Tecnologia S/A' },
            tradeName:             { type: 'string', example: 'AcmeTech' },
            taxId:                 { type: 'string', example: '12.345.678/0001-99' },
            companySize:           { type: 'string', enum: ['micro', 'small', 'medium', 'large', 'enterprise'] },
            industrySector:        { type: 'string', example: 'Tecnologia da Informacao' },
            marketSegment:         { type: 'string', example: 'B2B SaaS' },
            website:               { type: 'string', example: 'https://acmetech.com.br' },
            address:               { type: 'string', example: 'Av. Paulista, 1234' },
            city:                  { type: 'string', example: 'Sao Paulo' },
            state:                 { type: 'string', example: 'SP' },
            country:               { type: 'string', example: 'Brasil' },
            zipCode:               { type: 'string', example: '01310-100' },
            businessContactName:   { type: 'string', example: 'Carla Ferreira' },
            businessContactEmail:  { type: 'string', format: 'email', example: 'carla@acmetech.com' },
            businessContactPhone:  { type: 'string', example: '+55 11 3000-0001' },
            technicalContactName:  { type: 'string', example: 'Rafael Costa' },
            technicalContactEmail: { type: 'string', format: 'email', example: 'rafael@acmetech.com' },
            technicalContactPhone: { type: 'string', example: '+55 11 3000-0002' },
            businessObjectives:    { type: 'string', example: 'Modernizar sistema legado de gestao.' },
            technicalConstraints:  { type: 'string', example: 'Infraestrutura on-premise. Sem cloud.' },
            stakeholders: {
              type: 'array',
              items: { '$ref': '#/components/schemas/Stakeholder' },
            },
            status:                { type: 'string', enum: ['active', 'prospect', 'closed'], default: 'prospect' },
            relationshipStartDate: { type: 'string', format: 'date', example: '2023-03-15' },
            notes:                 { type: 'string' },
          },
        },

        UpdateClientRequest: {
          type: 'object',
          description: 'Todos os campos sao opcionais. Ao menos um deve ser informado.',
          properties: {
            companyName:           { type: 'string' },
            tradeName:             { type: 'string' },
            taxId:                 { type: 'string' },
            companySize:           { type: 'string', enum: ['micro', 'small', 'medium', 'large', 'enterprise'] },
            industrySector:        { type: 'string' },
            marketSegment:         { type: 'string' },
            website:               { type: 'string' },
            address:               { type: 'string' },
            city:                  { type: 'string' },
            state:                 { type: 'string' },
            country:               { type: 'string' },
            zipCode:               { type: 'string' },
            businessContactName:   { type: 'string' },
            businessContactEmail:  { type: 'string', format: 'email' },
            businessContactPhone:  { type: 'string' },
            technicalContactName:  { type: 'string' },
            technicalContactEmail: { type: 'string', format: 'email' },
            technicalContactPhone: { type: 'string' },
            businessObjectives:    { type: 'string' },
            technicalConstraints:  { type: 'string' },
            stakeholders: {
              type: 'array',
              items: { '$ref': '#/components/schemas/Stakeholder' },
            },
            status: { type: 'string', enum: ['active', 'prospect', 'closed'] },
            relationshipStartDate: { type: 'string', format: 'date' },
            notes:                 { type: 'string' },
          },
        },
      },

      // -----------------------------------------------------------------------
      // Responses reutilizaveis
      // -----------------------------------------------------------------------
      responses: {
        Unauthorized: {
          description: 'Token ausente, invalido ou expirado.',
          content: {
            'application/json': {
              schema: { '$ref': '#/components/schemas/ErrorResponse' },
              example: { success: false, message: 'Token de autenticacao nao fornecido.' },
            },
          },
        },
        NotFound: {
          description: 'Recurso nao encontrado.',
          content: {
            'application/json': {
              schema: { '$ref': '#/components/schemas/ErrorResponse' },
              example: { success: false, message: 'Registro nao encontrado.' },
            },
          },
        },
        UnprocessableEntity: {
          description: 'Dados de entrada invalidos.',
          content: {
            'application/json': {
              schema: { '$ref': '#/components/schemas/ErrorResponse' },
              example: {
                success: false,
                message: 'Dados de entrada invalidos.',
                errors: [{ field: 'email', message: 'Formato de e-mail invalido.' }],
              },
            },
          },
        },
      },
    },

    // Tags para agrupar os endpoints na UI
    tags: [
      { name: 'Auth',    description: 'Autenticacao — local, Google OAuth e Microsoft OAuth' },
      { name: 'Users',   description: 'CRUD de usuarios' },
      { name: 'Clients', description: 'CRUD de clientes (contexto BRD/FRD)' },
    ],
  },

  // Arquivos onde o swagger-jsdoc vai procurar anotacoes @swagger
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
