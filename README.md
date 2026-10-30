# SQA Social Media

Projeto educacional com uma API Spring Boot e um frontend Next.js.

## Visão Geral

- `api/`: backend Java 17 com Spring Boot, autenticação, usuários, posts e curtidas.
- `client/`: frontend Next.js/React que consome a API.

Principais rotas da aplicação:

- Frontend: `http://localhost:3000`
- API: `http://localhost:8080`

## Como Rodar

Pré-requisitos:

- Java 17+
- Node.js 18+
- npm
- MySQL configurado para o ambiente de desenvolvimento

API:

```bash
cd api
./mvnw spring-boot:run
```

Frontend:

```bash
cd client
npm install
npm run dev
```

O frontend usa `NEXT_PUBLIC_BASE_URL` para definir a URL da API. Exemplo de `.env` em `client/`:

```env
NEXT_PUBLIC_BASE_URL=http://localhost:8080
```

### Com Docker (sem instalar Java/MySQL)

```bash
docker compose up -d   # MySQL + API em http://localhost:8080
cd client && npm install && npm run dev
```

## Testes

| Tipo | Ferramenta | Local | Comando |
|------|------------|-------|---------|
| Caixa-branca (unidade/integração) da API | JUnit 5, Mockito, MockMvc + H2 | `api/src/test` | `cd api && ./mvnw test` |
| Caixa-branca (unidade) do frontend | Jest + Testing Library | `client/tests` | `cd client && npm test` |
| Caixa-preta (API REST) | Playwright | `e2e/tests/api` | `cd e2e && npm run test:api` |
| Caixa-preta (E2E na interface) | Playwright | `e2e/tests/e2e` | `cd e2e && npm run test:e2e` |

Os testes do Playwright precisam da API (`:8080`) e do frontend (`:3000`) rodando. Na primeira vez, instale o navegador com `cd e2e && npm install && npx playwright install chromium`.

Sem Java instalado, os testes da API podem rodar via Docker:

```bash
docker run --rm -v "$PWD/api":/app -w /app maven:3.9-eclipse-temurin-17 mvn -B test
```

## Integração Contínua

O workflow [`.github/workflows/ci.yml`](.github/workflows/ci.yml) roda em todo Pull Request aberto ou atualizado para a `main` (e em pushes na `main`):

1. **API**: Java 17 + `./mvnw test` (JUnit com H2 em memória).
2. **Client**: Node.js 22 + `npm ci`, lint, checagem de tipos e `npm test` (Jest).
3. **API e E2E** (após os dois anteriores passarem): sobe MySQL como service container, inicia a API e o frontend e executa toda a suíte do Playwright. Em caso de falha, o relatório e os logs ficam disponíveis como artefato.

## Documentações

- [README da API](api/README.md)
- [README do Frontend](client/README.md)
- [DummyJSON API Docs](https://dummyjson.com/docs)
