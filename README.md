# REST API Node.js + Angular Frontend

Aplicação fullstack com API REST em Node.js/Express e frontend Angular 19, compartilhando um único servidor Express em produção. Inclui autenticação multi-provider (Local, Google OAuth 2.0, Microsoft OAuth 2.0), gestão de clientes orientada a BRD/FRD e documentação interativa via Swagger.

---

## Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────┐
│                   Navegador                          │
└──────────┬──────────────────────────┬───────────────┘
           │                          │
    Rotas Angular              Chamadas /api/*
    (/clients, /auth…)         (JSON REST)
           │                          │
┌──────────▼──────────────────────────▼───────────────┐
│              Express.js (:3000)                      │
│                                                      │
│  express.static ──► public/frontend/   (build NG)   │
│  SPA catch-all  ──► index.html         (NG Router)  │
│  /api/*         ──► routes/            (REST API)   │
│  /health        ──► health check                    │
│  /api/docs      ──► Swagger UI (dev only)           │
└─────────────────────────────────────────────────────┘
           │
    Knex.js (query builder)
           │
    MariaDB / MySQL
```

Em **desenvolvimento**, o Angular roda separado em `:4200` com `ng serve` e um proxy encaminha `/api/*` para o Express em `:3000`. Em **produção**, o `ng build` gera os estáticos em `public/frontend/` e o Express os serve diretamente — eliminando a necessidade de um servidor web separado (Nginx, Apache etc.) para ambientes simples.

---

## Stack

### Backend

| Tecnologia | Versão | Papel |
|---|---|---|
| **Node.js** | ≥ 18 | Runtime — LTS ativo com suporte a ES2022+ |
| **Express.js** | 4.x | Framework HTTP |
| **Knex.js** | 3.x | Query builder — desacopla o código do dialeto SQL |
| **MariaDB / MySQL** | ≥ 10.6 / 8.0 | Banco de dados relacional (driver `mysql2`) |
| **Passport.js** | 0.7 | Autenticação extensível via strategies |
| **jsonwebtoken** | 9.x | Access token (15 min) + Refresh token (7 dias) stateless |
| **bcrypt** | 5.x | Hash de senhas com salt rounds 12 |
| **Zod** | 3.x | Validação declarativa com `safeParse` sem exceções |
| **Helmet** | 7.x | Headers HTTP de segurança (CSP, HSTS, X-Frame-Options…) |
| **swagger-jsdoc** | 6.x | Geração de spec OpenAPI 3.0 via JSDoc |
| **swagger-ui-express** | 5.x | Interface Swagger em `/api/docs` |
| **express-rate-limit** | 7.x | Proteção anti-brute-force nas rotas de auth |
| **morgan** | 1.x | Request logger |

### Frontend

| Tecnologia | Versão | Papel |
|---|---|---|
| **Angular** | 19.x | Framework SPA |
| **Angular Material** | 19.x | Design system M3 (azure + orange palette) |
| **TypeScript** | 5.x | Tipagem estática |
| **RxJS** | 7.x | Programação reativa (HTTP, debounce, merge) |
| **Signals API** | Angular 16+ | Estado reativo sem Zone.js explícito |
| **Standalone Components** | Angular 15+ | Sem NgModules — menor bundle, tree-shaking melhor |

### Decisões de Design

**CJS em vez de ESM no backend**
Knex.js, Passport.js e seus plugins têm melhor suporte e estabilidade com CommonJS. ESM com `require()` dinâmico em libs de terceiros pode gerar erros de interoperabilidade difíceis de depurar. CJS é a escolha pragmática para este stack.

**Zod em vez de Joi**
API moderna com encadeamento, transforms nativos, `safeParse()` que nunca lança exceções inesperadas e compatibilidade total com TypeScript — caso o projeto seja migrado futuramente.

**Detecção de build por `fs.existsSync` em vez de `NODE_ENV`**
O Express verifica a presença de `public/frontend/index.html` para decidir se serve o Angular. Isso resolve problemas de compatibilidade cross-platform com `NODE_ENV` no Windows e torna o comportamento autodescritivo: se o build existe, é servido; se não existe, o Express ignora.

---

## Pré-requisitos

- Node.js ≥ 18.0.0
- npm ≥ 9
- MariaDB ≥ 10.6 ou MySQL ≥ 8.0 rodando localmente
- Angular CLI: `npm install -g @angular/cli`

---

## Estrutura do Monorepo

```
project-servicenow-docs/
├── rest-api-node/               ← Backend Node.js/Express
│   ├── migrations/              # Migrations Knex (versionadas)
│   ├── seeds/                   # Seeds para desenvolvimento
│   ├── public/
│   │   └── frontend/            # Build do Angular (gerado por ng build)
│   ├── src/
│   │   ├── app.js               # Fábrica do Express (sem porta)
│   │   ├── server.js            # Entry point — bind de porta + graceful shutdown
│   │   ├── config/
│   │   │   ├── env.js           # Centraliza e valida variáveis de ambiente
│   │   │   ├── database.js      # Instância singleton do Knex
│   │   │   ├── passport.js      # Strategies Local, Google e Microsoft
│   │   │   └── swagger.js       # Spec OpenAPI 3.0
│   │   ├── controllers/         # Camada HTTP — monta req/res, delega ao service
│   │   │   ├── auth.controller.js
│   │   │   ├── user.controller.js
│   │   │   └── client.controller.js
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js          # authenticateJWT, optionalJWT
│   │   │   ├── errorHandler.middleware.js  # Error handler centralizado + AppError
│   │   │   ├── validate.middleware.js      # Factory de validação Zod
│   │   │   ├── requestLogger.middleware.js # Morgan
│   │   │   └── rateLimiter.middleware.js   # express-rate-limit
│   │   ├── models/              # Tipos/contratos das entidades
│   │   ├── routes/              # Roteadores Express com anotações Swagger
│   │   ├── services/            # Regras de negócio — única camada com acesso ao banco
│   │   └── validations/         # Schemas Zod por módulo
│   ├── .env.example
│   ├── knexfile.js
│   └── package.json
│
└── angular-frontend/            ← Frontend Angular 19
    ├── src/
    │   ├── app/
    │   │   ├── core/
    │   │   │   ├── models/      # Interfaces TypeScript (Client, User, Auth…)
    │   │   │   ├── services/    # AuthService, ClientService (Signals + HTTP)
    │   │   │   ├── guards/      # authGuard, publicGuard (funcionais)
    │   │   │   └── interceptors/# authInterceptor (Bearer token + refresh retry)
    │   │   ├── features/
    │   │   │   ├── auth/        # LoginComponent, CallbackComponent (OAuth)
    │   │   │   ├── layout/      # ShellComponent (sidenav responsivo)
    │   │   │   └── clients/     # ClientListComponent, ClientFormComponent
    │   │   └── shared/          # ConfirmDialogComponent
    │   └── styles.scss          # Tema Angular Material M3
    ├── proxy.conf.json          # Proxy /api → localhost:3000 (dev only)
    └── angular.json             # outputPath aponta para rest-api-node/public/frontend
```

---

## Instalação

### 1. Backend

```bash
cd rest-api-node

# Instale as dependências
npm install

# Configure o ambiente
cp .env.example .env
# Edite .env com suas credenciais

# Crie o banco de dados
mysql -u root -p -e "CREATE DATABASE rest_api_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Execute as migrations
npm run migrate

# (Opcional) Popule com dados de exemplo — 2 usuários + 100 clientes aleatórios
npm run seed
```

### 2. Frontend

```bash
cd angular-frontend

# Instale as dependências
npm install
```

---

## Configuração do .env

Copie `.env.example` para `.env` e preencha:

```env
# Servidor
PORT=3000
NODE_ENV=development

# Banco de dados
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASS=sua_senha
DB_NAME=rest_api_db

# JWT — gere valores únicos com o comando abaixo
JWT_SECRET=string_aleatoria_longa_minimo_64_chars
JWT_REFRESH_SECRET=outra_string_aleatoria_longa_minimo_64_chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# OAuth Google
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# OAuth Microsoft
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
MICROSOFT_CALLBACK_URL=http://localhost:3000/api/auth/microsoft/callback

# URL do frontend para redirecionamento pós-OAuth
# Em desenvolvimento: http://localhost:4200
# Em produção (frontend servido pelo Express): http://localhost:3000
FRONTEND_URL=http://localhost:4200

# Origens permitidas no CORS (separadas por vírgula)
# Em desenvolvimento: inclua a porta do ng serve
# Em produção: apenas o domínio final
CORS_ORIGINS=http://localhost:4200,http://localhost:3000
```

### Gerando JWT secrets seguros

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Execute duas vezes — um valor para `JWT_SECRET` e outro para `JWT_REFRESH_SECRET`.

---

## Rodando o Projeto

### Modo Desenvolvimento (recomendado para desenvolver)

Neste modo, o Angular roda com hot reload em `:4200` e um proxy encaminha as chamadas `/api/*` automaticamente para o Express em `:3000`. Não é necessário buildar o frontend.

**Terminal 1 — Backend:**
```bash
cd rest-api-node
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd angular-frontend
ng serve
```

Acesse `http://localhost:4200`.

> O arquivo `proxy.conf.json` na raiz do Angular configura o redirecionamento:
> ```json
> { "/api": { "target": "http://localhost:3000", "secure": false, "changeOrigin": true } }
> ```

### Modo Produção (tudo em um único servidor)

Neste modo, o Angular é compilado e os estáticos são copiados para dentro do projeto Express. O Express então serve tanto a API quanto o frontend a partir da porta `3000`.

```bash
cd rest-api-node

# Compila o Angular E inicia o servidor (tudo em um comando)
npm run start:prod
```

Acesse `http://localhost:3000`.

**O que acontece internamente:**

1. `ng build --configuration production` é executado no diretório `angular-frontend/`
2. O `angular.json` tem `outputPath` apontando para `../rest-api-node/public/frontend`
3. Os arquivos estáticos do Angular são gerados diretamente em `public/frontend/`
4. O servidor Express inicia e detecta a presença de `public/frontend/index.html`
5. O Express passa a servir os estáticos e entregar `index.html` para qualquer rota não-API (SPA fallback)

**Por que a detecção é por arquivo e não por `NODE_ENV`:**
- No Windows, a sintaxe `NODE_ENV=production node ...` não funciona nativamente no CMD/PowerShell
- A lógica "se o build existe, sirva-o" é mais coesa e autodescritiva do que depender de uma variável de ambiente
- Em desenvolvimento, a pasta `public/frontend/` não existe, então o Express ignora completamente

**Ajustes necessários no `.env` para produção:**
```env
FRONTEND_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000
```

### Scripts Disponíveis — Backend

```bash
npm run dev              # Inicia com nodemon (hot reload)
npm run start            # Inicia sem hot reload
npm run build:frontend   # Apenas compila o Angular (sem iniciar o servidor)
npm run start:prod       # Compila o Angular + inicia o servidor
npm run migrate          # Executa migrations pendentes
npm run migrate:rollback # Desfaz a última migration
npm run seed             # Popula o banco com dados de exemplo
```

### Scripts Disponíveis — Frontend

```bash
ng serve                             # Dev server com HMR em :4200
ng build                             # Build de produção
ng build --configuration development # Build de desenvolvimento (sem minificação)
```

---

## Usuários de Teste (após `npm run seed`)

| E-mail | Senha | Papel |
|--------|-------|-------|
| `admin@example.com` | `Admin@123456` | Administrador |
| `user@example.com` | `User@123456` | Usuário padrão |

---

## Endpoints da API

A documentação interativa completa está disponível em `http://localhost:3000/api/docs` (apenas em `NODE_ENV=development`).

### Health Check

```
GET /health
```

### Autenticação (`/api/auth`)

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | `/api/auth/register` | Registra usuário local | Público |
| POST | `/api/auth/login` | Login local (email + senha) | Público |
| GET | `/api/auth/google` | Inicia fluxo OAuth Google | Público |
| GET | `/api/auth/google/callback` | Callback OAuth Google | Público |
| GET | `/api/auth/microsoft` | Inicia fluxo OAuth Microsoft | Público |
| GET | `/api/auth/microsoft/callback` | Callback OAuth Microsoft | Público |
| POST | `/api/auth/refresh` | Renova access token via refresh token | Público |
| POST | `/api/auth/logout` | Revoga o refresh token | Público |

### Usuários (`/api/users`) — `Authorization: Bearer <token>` obrigatório

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/users?page=1&limit=10&search=joao` | Lista paginada com busca |
| GET | `/api/users/:id` | Busca por ID |
| POST | `/api/users` | Cria usuário |
| PUT | `/api/users/:id` | Atualiza parcialmente |
| DELETE | `/api/users/:id` | Soft delete (is_active = false) |

### Clientes (`/api/clients`) — `Authorization: Bearer <token>` obrigatório

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/clients?page=1&limit=10&search=acme&status=active` | Lista com filtros e paginação |
| GET | `/api/clients/:id` | Detalhes completos incluindo stakeholders |
| POST | `/api/clients` | Cria cliente |
| PUT | `/api/clients/:id` | Atualiza parcialmente |
| DELETE | `/api/clients/:id` | Soft delete (is_active = false) |

#### Filtros disponíveis em `GET /api/clients`

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `page` | number | Página (padrão: 1) |
| `limit` | number | Registros por página (padrão: 10, máx: 100) |
| `search` | string | Busca em razão social, nome fantasia e CNPJ |
| `status` | string | `active`, `prospect` ou `closed` |
| `companySize` | string | `micro`, `small`, `medium`, `large`, `enterprise` |
| `marketSegment` | string | Filtro por segmento de mercado |

---

## Padrão de Respostas

### Sucesso simples
```json
{ "success": true, "data": { "id": "...", "companyName": "Acme S/A" } }
```

### Lista paginada
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 102,
    "totalPages": 11
  }
}
```

### Erro de validação (HTTP 422)
```json
{
  "success": false,
  "message": "Dados de entrada inválidos.",
  "errors": [
    { "field": "email", "message": "Formato de e-mail inválido." },
    { "field": "password", "message": "Mínimo de 8 caracteres." }
  ]
}
```

### Erro de aplicação
```json
{ "success": false, "message": "Mensagem legível pelo usuário." }
```

---

## Banco de Dados — Convenções Knex

O Knex converte automaticamente entre `snake_case` (banco) e `camelCase` (JavaScript) via `postProcessResponse` e `wrapIdentifier` definidos no `knexfile.js`.

| Banco (`snake_case`) | JavaScript (`camelCase`) |
|----------------------|--------------------------|
| `first_name` | `firstName` |
| `created_at` | `createdAt` |
| `tax_id` | `taxId` |
| `company_size` | `companySize` |

> **Atenção:** Sempre use `camelCase` ao acessar propriedades retornadas pelo Knex nos services e controllers. O mapeamento acontece automaticamente na camada de dados.

### Migrations

```bash
npm run migrate          # Aplica todas as migrations pendentes
npm run migrate:rollback # Desfaz a última batch de migrations
```

As migrations estão em `migrations/` e são versionadas pelo prefixo de timestamp.

---

## Configuração OAuth

### Google

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Crie um projeto → habilite a **Google Identity API**
3. Em *Credentials*, crie **OAuth 2.0 Client ID** do tipo *Web Application*
4. Adicione em *Authorized redirect URIs*:
   - Desenvolvimento: `http://localhost:3000/api/auth/google/callback`
   - Produção: `https://seudominio.com/api/auth/google/callback`
5. Copie `Client ID` e `Client Secret` para o `.env`

### Microsoft (Azure AD)

1. Acesse [Azure Portal → App registrations](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps)
2. Clique em **New registration** → preencha o nome do app
3. Em *Redirect URI*, selecione *Web* e adicione:
   - Desenvolvimento: `http://localhost:3000/api/auth/microsoft/callback`
   - Produção: `https://seudominio.com/api/auth/microsoft/callback`
4. Vá em **Certificates & secrets** → *New client secret* → copie o valor imediatamente (não é exibido novamente)
5. Copie o *Application (client) ID* e o *Secret value* para o `.env`

### Fluxo OAuth no Frontend

O login via SSO funciona com redirecionamento real do browser (não via `fetch`/`XMLHttpRequest`):

1. Usuário clica em "Entrar com Google" → `window.location.href = 'http://localhost:3000/api/auth/google'`
2. O backend redireciona para o provider (Google/Microsoft)
3. Após autenticação, o provider redireciona para o callback do backend
4. O backend gera os tokens e redireciona para `FRONTEND_URL/auth/callback?access_token=...&refresh_token=...`
5. O `CallbackComponent` do Angular lê os parâmetros da URL, armazena os tokens e navega para `/clients`

> **Por isso o `FRONTEND_URL` no `.env` deve estar correto:** em desenvolvimento, `http://localhost:4200`; em produção (tudo no Express), `http://localhost:3000`.

---

## Frontend Angular — Decisões de Arquitetura

### Standalone Components
Todos os componentes usam `standalone: true` — sem NgModules. Cada componente declara suas próprias dependências no array `imports`, tornando o código autocontido e o tree-shaking mais eficiente.

### Signals API
Estado gerenciado com `signal()`, `computed()` e `toSignal()`. Evita `async pipe` excessivo e torna a lógica de template mais legível:
```typescript
readonly isAuthenticated = computed(() => this._currentUser() !== null);
```

### ChangeDetectionStrategy.OnPush
Aplicado em todos os componentes. O Angular só re-renderiza quando um `signal` ou `Input` muda, não em cada ciclo de detecção global — melhor performance.

### Interceptor de Refresh Token
O `authInterceptor` adiciona o Bearer token em todas as requisições. Em caso de `401`, tenta renovar o access token automaticamente via refresh token antes de fazer logout — fluxo transparente para o usuário.

### Guards Funcionais
```typescript
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isAuthenticated() ? true : inject(Router).createUrlTree(['/auth/login']);
};
```
Sem classes, sem `implements CanActivate` — compatível com Angular 15+ e mais simples de testar.

---

## Segurança

- Senhas armazenadas com **bcrypt** (salt rounds 12) — nunca em texto plano
- Access token com **TTL de 15 minutos** — janela curta reduz o impacto de vazamentos
- Refresh tokens **persistidos no banco** — revogáveis individualmente no logout
- **Helmet** configura headers defensivos: CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- **Rate limiting**: 20 requisições por 15 minutos nas rotas de autenticação
- **Soft delete**: registros nunca são apagados fisicamente (`is_active = false`)
- Variáveis sensíveis exclusivamente via **dotenv** — nunca commitadas no repositório
- Stack trace exposto **apenas em `NODE_ENV=development`**
- CORS configurável via `CORS_ORIGINS` — restringe origens aceitas

---

## Licença

MIT
