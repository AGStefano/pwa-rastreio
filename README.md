# Rastreio de Pedidos — STLFLIX

Sistema de rastreio de pedidos para e-commerce, integrado ao **Tiny ERP** (Olist) e à **Olist Envios**. Mantém um banco local sincronizado via cron (nunca webhook) e expõe uma API + PWA para o cliente final consultar seus pedidos.

---

## 1. Estrutura do repositório

```
pwa-rastreio/
├── backend/     API Node.js + Express + Prisma + PostgreSQL, cron de sincronização
├── frontend/    PWA em React + Vite, consome a API do backend
└── (arquivos na raiz: PWA antigo, não usado por este sistema)
```

Backend e frontend são projetos independentes, cada um com seu próprio `package.json`, `.env` e ciclo de deploy.

---

## 2. Stack técnica

| Camada | Tecnologia |
|---|---|
| Backend | Node.js, Express, Prisma ORM, PostgreSQL, node-cron, axios |
| Frontend | React + Vite, React Router, Tailwind CSS, vite-plugin-pwa |
| Integrações externas | API Tiny ERP (`api.tiny.com.br`), API Olist Envios (`envios-api.olist.com`) |

---

## 3. Backend (`/backend`)

### 3.1 Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

| Variável | Para que serve |
|---|---|
| `DATABASE_URL` | String de conexão do PostgreSQL |
| `PORT` | Porta da API (padrão 3000) |
| `TINY_API_TOKEN_FILAMENTO` | Token da conta Tiny de filamentos (**obrigatório**) |
| `TINY_API_TOKEN_IMPRESSORA` | Token da conta Tiny de impressoras (**obrigatório**) |
| `TINY_API_BASE_URL` | Base da API do Tiny (não precisa mudar) |
| `TINY_HTTP_TIMEOUT_MS` | Timeout das chamadas ao Tiny |
| `OLIST_ENVIOS_BASE_URL` | Base da API de rastreio da Olist Envios |
| `OLIST_HTTP_TIMEOUT_MS` | Timeout das chamadas de rastreio |
| `TINY_RATE_LIMIT_PER_MINUTE` | Limite de requisições/min ao Tiny (limite real é 60, deixamos margem — padrão 45) |
| `TINY_RETRY_MAX_ATTEMPTS` / `TINY_RETRY_BASE_DELAY_MS` | Retry com backoff exponencial em caso de erro de rate limit (429 ou erro equivalente no corpo da resposta do Tiny) |
| `SYNC_CRON_INTERVAL_MINUTES` | De quanto em quanto tempo o cron de sincronização roda |
| `SYNC_SAFETY_MARGIN_MINUTES` | Margem de segurança pra não perder atualizações que aconteçam durante a própria sincronização |
| `SYNC_INITIAL_DATE` | Data usada só na primeiríssima sincronização (antes de existir um registro em `sync_control`) |
| `ADMIN_TOKEN` | Se preenchido, protege o endpoint `POST /api/sync/run` (precisa do header `x-admin-token`). **Defina isso em produção** — vazio, o endpoint fica aberto |
| `CORS_ORIGIN` | Origem liberada pra consumir a API. `"*"` serve pra dev; **em produção, troque pelo domínio real do frontend** |

### 3.1.1 Duas contas Tiny (filamento + impressora)

Existem 2 contas Tiny distintas (mesma API, tokens diferentes) sincronizadas pro **mesmo banco**. Cada pedido salvo carrega um campo `origem` (`"filamento"` ou `"impressora"`) indicando de qual conta ele veio.

- O `id` do Tiny **não é globalmente único** — cada conta tem sua própria numeração, então um pedido da conta de impressoras pode ter o mesmo `id` de um pedido de filamentos. Por isso o banco tem um `id` interno próprio (sequencial, gerado pelo Postgres) e guarda o id do Tiny separadamente (coluna `tiny_id`); a identidade real de um pedido pra fins de sincronização é o par (`tiny_id`, `origem`).
- A sincronização roda as duas contas **sequencialmente** (primeiro filamento, depois impressora), cada uma com seu próprio cursor de última sincronização (tabela `sync_control`, uma linha por origem) e seu próprio orçamento de rate limit (60/min cada, são tokens diferentes).
- **Busca e detalhe do pedido não diferenciam as contas** — o cliente final busca por CPF/telefone/e-mail/número normalmente, sem precisar saber ou escolher se é filamento ou impressora. O campo `origem` só aparece no detalhe completo do pedido (`GET /api/pedidos/:id`), útil pra suporte/debug.

### 3.2 Banco de dados

```bash
cd backend
npm install
npx prisma migrate deploy   # aplica as migrations existentes (produção)
```

> Use `prisma migrate deploy` em produção, não `prisma migrate dev` (esse último é interativo e pode tentar recriar o banco).

Tabelas: `pedidos` (dados sincronizados do Tiny) e `sync_control` (timestamp da última sincronização bem-sucedida).

### 3.3 Rodando

```bash
npm start          # produção, sem watch
npm run dev         # desenvolvimento, com --watch
npm run sync        # dispara uma sincronização manual via CLI (útil pra popular o banco a primeira vez)
```

### 3.4 ⚠️ Cron de sincronização — checar antes do deploy

Em `src/server.js`, a chamada que liga o cron está **comentada**:

```js
app.listen(env.port, () => {
  logger.info(`Servidor rodando em http://localhost:${env.port}`);
  // iniciarCronDeSincronizacao();
});
```

Isso foi desativado propositalmente durante o desenvolvimento (pra não gastar rate limit do Tiny em testes). **Descomente essa linha antes de subir em produção**, senão o banco nunca mais sincroniza sozinho — só via `npm run sync` ou `POST /api/sync/run` manual.

O cron: lê o timestamp salvo em `sync_control`, busca no Tiny (`pedidos.pesquisa.php`) tudo que mudou desde então, busca o detalhe completo de cada pedido (`pedido.obter.php`), faz upsert no banco, e só então salva o novo timestamp (com a margem de segurança). Respeita o rate limit configurado via fila/throttle interno.

### 3.5 Referência da API

Todas as respostas de erro seguem o formato:
```json
{ "error": { "code": "ALGUM_CODIGO", "message": "Mensagem legível." } }
```

#### `GET /api/health`
Healthcheck simples. `200 { "status": "ok" }`.

#### `GET /api/pedidos/buscar?query=...` — busca pública por qualquer campo

Esse é o endpoint pra qualquer integração futura que precise **buscar pedidos sem saber o id interno**. Aceita um único parâmetro `query` com **qualquer** um destes valores, com ou sem máscara/pontuação:

| Tipo de valor | Exemplos aceitos |
|---|---|
| CPF | `104.596.059-41` ou `10459605941` |
| CNPJ | `12.345.678/0001-90` ou `12345678000190` |
| Telefone | `(47) 99727-1613` ou `47997271613` |
| E-mail | `cliente@exemplo.com` |
| Número do pedido (Tiny) | `21340` |
| Número do pedido (e-commerce) | `103505` ou `ECOM-4021` |

```
GET /api/pedidos/buscar?query=104.596.059-41
```
```json
{
  "resultados": [
    { "id": 776659354, "numero": 21340, "numeroEcommerce": "103505", "dataPedido": "2026-07-16T03:00:00.000Z", "situacao": "Entregue", "valorFrete": "105.61", "nomeCliente": "Bianca Garcia de Sá" }
  ]
}
```
Sempre retorna uma **lista** (pode ter 0, 1 ou vários pedidos — a mesma pessoa pode ter múltiplos pedidos com o mesmo CPF/e-mail/telefone).

#### `GET /api/pedidos/:id` — endpoint flexível (aceita id interno OU qualquer busca)

Esse é o endpoint "que aceita tudo": o `:id` pode ser o **id interno do pedido** (o `id` retornado por `/buscar`) **ou qualquer um dos valores de busca da tabela acima**.

Comportamento:
1. Se `:id` for numérico e couber como id interno, tenta buscar direto (caminho rápido).
2. Se não encontrar (ou não for um número plausível), trata o valor como busca livre — mesma lógica do `/buscar`.
3. Se essa busca livre encontrar **exatamente 1 pedido**, retorna o pedido completo.
4. Se encontrar **0 ou vários**, retorna a lista de resultados resumidos (mesmo formato do `/buscar`) em vez do pedido completo — quem chama precisa checar se a resposta é um objeto único ou uma lista/vazio.

> Isso é pensado pro **frontend** (que já lida com essas 3 situações). Se for consumir esse endpoint de outro sistema, prefira `GET /api/pedidos/buscar?query=...` (contrato mais simples e previsível — sempre uma lista) e depois `GET /api/pedidos/:id` só com o id interno já resolvido.

```
GET /api/pedidos/776659354
```
```json
{
  "id": 776659354,
  "tinyId": 776659354,
  "origem": "filamento",
  "numero": 21340,
  "numeroEcommerce": "103505",
  "dataPedido": "2026-07-16T03:00:00.000Z",
  "dataFaturamento": "2026-07-16T03:00:00.000Z",
  "dataEnvio": "2026-07-17T03:00:00.000Z",
  "dataEntrega": null,
  "situacao": "Enviado",
  "nomeCliente": "Bianca Garcia de Sá",
  "cpfCnpj": "104.596.059-41",
  "cpfCnpjLimpo": "10459605941",
  "telefone": "(47) 99727-1613",
  "telefoneLimpo": "47997271613",
  "email": "cliente@exemplo.com",
  "enderecoCobranca": { "logradouro": "...", "numero": "...", "bairro": "...", "cidade": "...", "uf": "...", "cep": "..." },
  "enderecoEntrega": { "...": "..." },
  "valorFrete": "24.9",
  "formaEnvio": "Correios",
  "formaFrete": "PAC",
  "urlRastreamento": "https://...",
  "codigoRastreamento": "OB123456789BR",
  "idNotaFiscal": 555,
  "criadoEm": "...",
  "atualizadoEm": "..."
}
```

#### `GET /api/pedidos/:id/rastreio`

Busca o rastreio **ao vivo** na Olist Envios (nunca salvo no banco). Se o pedido não tiver `codigoRastreamento`, não chama a Olist — retorna a situação atual com um aviso amigável. Se a chamada externa falhar/der timeout, também retorna um aviso amigável em vez de erro — nunca quebra.

```json
{
  "situacao": "Enviado",
  "codigoRastreamento": "OB123456789BR",
  "rastreio": { "carrier_name": "Correios", "events": [ { "title": "...", "datetime": "...", "location": "..." } ], "delivery_detail": { "carrier_promissed_date": "..." } },
  "aviso": null
}
```

#### `GET /api/pedidos/:id/nota-fiscal`

Proxy do PDF da nota fiscal (o cliente nunca vê a URL da Olist). Se o pedido não tiver `idNotaFiscal`, retorna `404` com mensagem clara. Se tiver, faz o download do PDF no servidor e repassa (`Content-Type: application/pdf`, `Content-Disposition: attachment`).

#### `POST /api/sync/run`

Dispara uma sincronização manual das duas contas (sequencial: filamento, depois impressora). Se `ADMIN_TOKEN` estiver definido, exige o header `x-admin-token`. Retorna um resumo agregado e o detalhamento por conta:
```json
{
  "duracaoMs": 4210,
  "totalEncontrados": 12,
  "novos": 3,
  "atualizados": 9,
  "erros": 0,
  "contas": [
    { "origem": "filamento", "totalEncontrados": 8, "novos": 2, "atualizados": 6, "erros": 0, "detalhesErros": [] },
    { "origem": "impressora", "totalEncontrados": 4, "novos": 1, "atualizados": 3, "erros": 0, "detalhesErros": [] }
  ]
}
```

---

## 4. Frontend (`/frontend`)

### 4.1 Variáveis de ambiente

`.env`:
```
VITE_API_BASE_URL="https://api.seu-dominio.com/api"
```

⚠️ **Essa variável é embutida no build** (Vite lê `.env` só na hora de compilar) — se mudar depois do deploy, precisa gerar um build novo. Aponte pra URL pública real da API antes de rodar `npm run build`.

### 4.2 Rodando

```bash
cd frontend
npm install
npm run dev              # desenvolvimento (sem service worker)
npm run build            # build de produção
npm run preview          # testa o build localmente (com service worker/PWA ativos)
```

### 4.3 Rotas

| Rota | O que faz |
|---|---|
| `/` | Campo de busca. Lembra a última busca no `localStorage` (só preenche o campo, não navega sozinho) |
| `/pedido/:query` | Rota única de resultado — aceita id interno ou qualquer valor de busca (mesma lógica do endpoint flexível do backend). Mostra o detalhe direto (1 resultado) ou a lista pra escolher (vários) |

### 4.4 PWA

- Manifest e ícones já gerados em `public/icons/` (script `npm run generate-icons`, só precisa rodar de novo se a arte do ícone mudar — usa `sharp` sob demanda, não fica instalado permanentemente).
- Service worker: `NetworkFirst` pra `/api/*` (nunca serve rastreio/pedido desatualizado do cache), `cache-first` pro resto dos assets estáticos.
- **Só funciona em produção com HTTPS** (ou `localhost`). Testar localmente exige `npm run build && npm run preview`, não `npm run dev`.

---

## 5. Checklist antes de aprovar o deploy

- [ ] `backend/.env`: `TINY_API_TOKEN_FILAMENTO` **e** `TINY_API_TOKEN_IMPRESSORA` reais preenchidos (não o placeholder de dev) — as duas contas são obrigatórias, o backend não sobe sem as duas
- [ ] `backend/.env`: `CORS_ORIGIN` apontando pro domínio real do frontend (não `"*"`)
- [ ] `backend/.env`: `ADMIN_TOKEN` definido (senão o endpoint de sync manual fica público)
- [ ] `backend/src/server.js`: **linha do cron descomentada** (`iniciarCronDeSincronizacao()`) — sem isso o banco nunca sincroniza sozinho
- [ ] `npx prisma migrate deploy` rodado no banco de produção
- [ ] `frontend/.env`: `VITE_API_BASE_URL` com a URL pública real da API, **antes** de rodar `npm run build`
- [ ] Domínio de produção servindo em **HTTPS** (obrigatório pro service worker/instalação do PWA)
- [ ] Rodar `npm run sync` (ou `POST /api/sync/run`) uma vez manualmente após o primeiro deploy, pra popular o banco antes do cron esperar o próprio intervalo

---

## 6. Limitações conhecidas (decisões de negócio já tomadas, não são bugs)

- Não existe busca por número de nota fiscal (decisão consciente — não compensava uma chamada extra ao Tiny só pra isso).
- Download de nota fiscal não valida CPF/CNPJ do solicitante — qualquer um com o link do pedido baixa.
- O campo de valor mostrado na listagem de busca é o **valor do frete** (`valorFrete`), não o valor total do pedido — o schema do banco não guarda o total (só o que veio especificado no escopo original). Se precisar do total, é preciso adicionar um campo novo vindo do Tiny.
- Sincronização é 100% polling — nenhuma das duas APIs (Tiny, Olist Envios) tem webhook.
