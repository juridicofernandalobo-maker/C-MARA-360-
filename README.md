# Câmara 360º

> **A Câmara mais inteligente. O vereador mais presente. O cidadão mais ouvido.**

Plataforma SaaS multi-institucional para Câmaras Municipais, que reúne em um só produto:

| Pilar | Entrega |
|---|---|
| **Câmara Digital** | Processo legislativo, sessões e administração sem papel |
| **Fiscalização 360º** | Dados do Executivo, alertas e dossiês com evidências rastreáveis |
| **Cidade Conectada** | Demandas do cidadão, participação e prestação de contas |

## Estrutura do repositório

```
camara-360/
├── packages/
│   └── rito/           Motor de ritos legislativos configuráveis (TypeScript puro, 33 testes)
├── apps/
│   ├── api/            Backend do MVP — NestJS + PostgreSQL (Prisma), 17 testes de ponta a ponta
│   └── web/            Protótipo navegável das 8 telas estratégicas (React + Vite)
└── docs/
    ├── 01-conceito.md          Proposta de valor, públicos e diferenciais
    ├── 02-arquitetura.md       12 módulos, arquitetura técnica e stack
    ├── 03-matriz-legal.md      Requisitos legais por módulo
    ├── 04-roadmap-mvp.md       Etapas, escopo do MVP e demonstrações
    ├── 05-api.md               Endpoints, perfis de acesso e exemplos
    └── 06-motor-de-ritos.md    Como o motor aplica a Lei Orgânica e o Regimento
```

## Como rodar

Requisitos: [Node.js 20+](https://nodejs.org) e [Docker](https://www.docker.com/) (para o banco de dados).

```bash
npm install
```

**Protótipo visual** (não precisa de banco):

```bash
npm run dev:web
```

**Backend (API):**

```bash
docker compose up -d
cp apps/api/.env.example apps/api/.env
npm run build -w @camara360/rito
npm run db:migrate -w @camara360/api
npm run db:seed -w @camara360/api
npm run dev:api
```

A API fica em http://localhost:3000/api. O seed cria a Câmara fictícia `vale-verde` com usuários de demonstração (senha `Camara360@demo`) — veja `docs/05-api.md`.

**Testes:**

```bash
npm test
```

> Os testes da API apagam e recriam o banco indicado em `DATABASE_URL_TESTE` (padrão: `camara360_test` local). Nunca aponte para um banco com dados reais.

> Todos os dados de demonstração são **fictícios**.

## Princípios inegociáveis do produto

1. **IA assiste, humano decide** — toda minuta, parecer ou ata gerada por IA exige revisão e assinatura de autoridade competente; a intervenção humana fica registrada.
2. **Alerta ≠ irregularidade** — o Radar distingue *alerta*, *inconsistência*, *indício* e *conclusão formal*, sempre com fonte e cálculo reproduzível.
3. **Institucional, não eleitoral** — dados de atendimento ao cidadão não podem ser exportados para fins partidários ou de campanha; o portal é da Câmara, com publicidade impessoal (CF, art. 37, §1º).
4. **Regras locais parametrizadas** — quóruns, prazos, ritos e espécies normativas vêm da Lei Orgânica e do Regimento Interno de cada Casa.
5. **Segurança em todos os planos** — LGPD, MFA, auditoria e backups não são recursos "premium".
