# Restaurante SaaS Multi-Tenant

Backend + frontend para plataforma white-label de delivery por restaurante (tenant), com isolamento por subdominio.

## Conceito

- Nao e marketplace.
- Cada tenant possui sua propria loja, catalogo, pedidos e identidade visual.
- O frontend consumidor sempre carrega uma unica loja por acesso.
- Cada restaurante possui campo dedicado `subdomain` na base de dados.

## Como trocar tenant no localhost

Em ambiente local, o tenant e resolvido por query string `tenant`.

1. Liste restaurantes e pegue o `slug`:

```bash
GET http://localhost:3000/api/v1/public/restaurants?page=1&per_page=50
```

2. Abra a loja passando o tenant na URL:

```text
http://localhost:3000/?tenant=sushi-prime
```

3. Para trocar de tenant, mude apenas o valor de `tenant` e recarregue a pagina.

Exemplos:

- `http://localhost:3000/?tenant=sushi-prime`
- `http://localhost:3000/?tenant=restaurante-do-joao`

## Observacoes importantes

- Sem subdominio e sem `?tenant=...`, o endpoint de resolucao retorna erro 400 em localhost.
- Endpoint oficial de resolucao:

```bash
GET /api/v1/public/tenant/current?tenant=<slug-do-tenant>
```

## Producao (subdominio -> ID)

Para o cenário:

- `https://restaurante01.catini.org` -> restaurante ID 1
- `https://restaurante02.catini.org` -> restaurante ID 2

configure no `.env`:

```env
TENANT_BASE_DOMAINS=catini.org
TENANT_REQUIRE_BASE_DOMAIN=true
TENANT_ID_PREFIX=restaurante
TENANT_ALLOW_QUERY_OVERRIDE=false
TENANT_TRUST_PROXY=true
```

Notas:

- O dominio base e configuravel (`TENANT_BASE_DOMAINS`), entao pode trocar `catini.org` sem alterar codigo.
- O backend resolve primeiro por padrao `TENANT_ID_PREFIX + numero` (ex: `restaurante01` -> ID 1).
- Se nao casar com o padrao por ID, resolve por `restaurants.subdomain`.
- Fallback final: `slug`/`trade_name`.
- Em ambientes com proxy (Nginx/Cloudflare/Ingress), mantenha `TENANT_TRUST_PROXY=true` para leitura correta de host.

## Frontend

Documentacao detalhada do frontend em:

- `public/frontend/README.md`

