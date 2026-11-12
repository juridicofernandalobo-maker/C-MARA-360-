# 02 — Arquitetura funcional e técnica

## 12 módulos sobre um Núcleo Integrador
Núcleo: cadastro único, processos, documentos, permissões, auditoria, IA e integração de dados.

| # | Módulo | Entregas principais |
|---|---|---|
| 1 | Processo Legislativo | Espécies normativas, editor com modelos, numeração automática, protocolo, assinatura, distribuição às comissões, prazos, emendas com comparação de versões, sanção/veto/promulgação/publicação |
| 2 | Radar de Fiscalização | 8 áreas (saúde, educação, obras, pessoal, licitações, patrimônio, orçamento, transferências), alertas, dossiês |
| 3 | Gabinete Digital | Caixa de demandas, equipe, agenda, proposições, evidências de visitas, requerimentos ao Executivo, relatórios |
| 4 | Cidadão Conectado | Relatar problema, mapa, acompanhar pedido, opinar, assistir sessão, falar com a Câmara |
| 5 | Plenário Inteligente | Pauta, presença/quórum, oradores, cronômetro, votação, painel, transcrição, minuta de ata |
| 6 | Orçamento e Emendas | PPA/LDO/LOA, emendas, créditos adicionais, execução, trilha completa da emenda |
| 7 | Comissões | Reuniões, relatoria, pareceres, prazos, diligências, audiências |
| 8 | Gestão Administrativa | Compras, contratos, patrimônio, almoxarifado, protocolo, processos (integração ao SIAFIC, sem contabilidade paralela) |
| 9 | Legislação Municipal | Lei Orgânica, Regimento, legislação consolidada e versionada |
| 10 | Inteligência Artificial | RAG sobre normas locais, minutas, resumos, apoio à fiscalização |
| 11 | Transparência e BI | Portal, e-SIC, ouvidoria, dados abertos, indicadores |
| 12 | Integrações | SAPL, SIAFIC, TCE (SIM/TCE-CE), PNCP, assinatura, mensageria |

## Motor de ritos configurável (núcleo do Módulo 1)
Cada Câmara cadastra, a partir da sua Lei Orgânica e Regimento:
- espécies de proposição e regras de iniciativa (inclusive reservada ao Prefeito);
- quóruns (maioria simples, absoluta, 2/3) por espécie/turno;
- prazos e regimes (ordinário, urgência, urgência urgentíssima);
- comissões competentes e fluxo de pareceres;
- número de turnos e interstício;
- fases pós-aprovação (redação final, autógrafo, sanção/veto, promulgação).

Representação: máquina de estados por espécie, com transições guardadas por regras (`guards`) parametrizadas — não há rito "embutido" no código.

## Radar: níveis de achado
| Nível | Significado | Pode ser publicado? |
|---|---|---|
| Alerta | Regra automática disparou (ex.: obra sem medição há 90 dias) | Não — uso interno do gabinete |
| Inconsistência | Divergência entre fontes confirmada pelo cálculo | Não, salvo decisão do parlamentar |
| Indício | Análise humana aponta elementos que merecem apuração | Com cautela, sem imputação |
| Conclusão formal | Resultado de procedimento próprio (CPI, TCE, parecer) | Sim, conforme o procedimento |

Todo achado guarda: fonte, data de extração, consulta/cálculo reproduzível e documentos.

## Arquitetura técnica
- **Monólito modular** (NestJS) com eventos internos — evoluir para serviços apenas se necessário.
- **Multi-tenant** com segregação por `camaraId` + Row-Level Security no PostgreSQL.

| Camada | Tecnologia |
|---|---|
| Web | React / Next.js + TypeScript |
| App | PWA (depois React Native) |
| Backend | NestJS / Node.js |
| Banco | PostgreSQL (+ PostGIS para o mapa, pgvector para busca semântica) |
| Documentos/busca | Armazenamento de objetos + OpenSearch |
| Workflow | Motor BPMN / máquina de estados |
| IA | LLM com RAG e citação obrigatória de fonte |
| Assíncrono | Filas e workers (importadores, transcrição, alertas) |
| Infra | Nuvem com backup, observabilidade, alta disponibilidade |

## Interfaces (mesma base de dados)
Painel da Presidência · Gabinete do Vereador · Central de Fiscalização · Painel do Plenário · Portal/App do Cidadão.
