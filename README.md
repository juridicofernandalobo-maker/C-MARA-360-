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
├── apps/
│   └── web/            Protótipo navegável das 8 telas estratégicas (React + Vite + TypeScript)
├── packages/
│   └── db/             Modelo de dados inicial (Prisma / PostgreSQL)
└── docs/
    ├── 01-conceito.md          Proposta de valor, públicos e diferenciais
    ├── 02-arquitetura.md       12 módulos, arquitetura técnica e stack
    ├── 03-matriz-legal.md      Requisitos legais por módulo (CF, LRF, LGPD, 14.133, eleitoral…)
    └── 04-roadmap-mvp.md       Etapas, escopo do MVP e roteiro das demonstrações
```

## Como rodar o protótipo

Requisitos: [Node.js 20+](https://nodejs.org).

```bash
cd apps/web
npm install
npm run dev
```

Abra o endereço exibido no terminal (normalmente http://localhost:5173).

> Todos os dados exibidos no protótipo são **fictícios**. Nenhum alerta representa constatação sobre ente público real.

## Princípios inegociáveis do produto

1. **IA assiste, humano decide** — toda minuta, parecer ou ata gerada por IA exige revisão e assinatura de autoridade competente; a intervenção humana fica registrada.
2. **Alerta ≠ irregularidade** — o Radar distingue *alerta*, *inconsistência*, *indício* e *conclusão formal*, sempre com fonte e cálculo reproduzível.
3. **Institucional, não eleitoral** — dados de atendimento ao cidadão não podem ser exportados para fins partidários ou de campanha; o portal é da Câmara, com publicidade impessoal (CF, art. 37, §1º).
4. **Regras locais parametrizadas** — quóruns, prazos, ritos e espécies normativas vêm da Lei Orgânica e do Regimento Interno de cada Casa.
5. **Segurança em todos os planos** — LGPD, MFA, auditoria e backups não são recursos "premium".
