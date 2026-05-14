# Frontend Consumidor Multi-Tenant

Aplicacao SPA mobile-first em AngularJS para o fluxo do cliente consumidor em modelo SaaS white-label por subdominio.

## Modelo de produto

- Nao e marketplace.
- Cada subdominio representa um tenant/restaurante.
- O frontend identifica o tenant automaticamente pelo hostname.
- A experiencia sempre mostra apenas uma loja por acesso.

Exemplo: restaurantedojoao.catini.org -> tenant "restaurantedojoao"

## Funcionalidades entregues

- Storefront unico do tenant (cardapio, categorias, adicionais, observacoes)
- Carrinho local isolado por tenant
- Login e cadastro com fluxo tradicional
- Estrutura preparada para Google e Microsoft SSO
- Checkout com enderecos, cupom e metodo de pagamento
- Integracao com API REST v1
- Interceptors para JWT e tratamento global de erro
- Service Worker com cache seguro e sem cache de rotas de API

## Estrutura

- app/modules: organizacao modular
- app/routes: estados do UI Router (storefront unico + auth + checkout)
- app/services: integracoes e regras de negocio
- app/interceptors: auth e erro
- app/controllers: controle de telas
- app/components: cards e controles reutilizaveis
- app/directives: mascaras e comportamento de formulario
- app/filters: formatacao
- app/layouts: shells principais
- views: templates por dominio (sem discovery/listagem global)
- assets/css: design system e estilos mobile-first

## Multi-tenant

- TenantService detecta subdominio e resolve restaurante.
- Tema visual (cores de marca) e aplicado dinamicamente por tenant.
- Carrinho usa chave localStorage com sufixo do tenant.
- Checkout sincroniza somente com o restaurante do tenant atual.

## Localhost (troca de tenant)

Em localhost, nao existe subdominio real por tenant. Por isso, use query string `tenant`.

1. Descubra um slug valido:

```bash
GET http://localhost:3000/api/v1/public/restaurants?page=1&per_page=50
```

2. Abra a aplicacao com o tenant desejado:

```text
http://localhost:3000/?tenant=sushi-prime
```

3. Para alternar tenant local, troque o valor de `tenant` e recarregue a pagina.

Endpoint oficial de resolucao de tenant:

```bash
GET /api/v1/public/tenant/current?tenant=<slug-do-tenant>
```

## Fluxo de checkout

1. Usuario acessa o subdominio do restaurante.
2. Frontend resolve o tenant e carrega o cardapio da loja.
3. Usuario adiciona itens no carrinho local isolado por tenant.
2. Ao entrar no checkout, autenticacao e obrigatoria.
3. Carrinho local e sincronizado para /api/v1/customer/cart.
4. Pedido e concluido via /api/v1/customer/orders.
