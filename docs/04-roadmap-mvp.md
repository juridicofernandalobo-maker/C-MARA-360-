# 04 — Roadmap, MVP e demonstrações

## Etapas
| Etapa | Escopo | Objetivo comercial |
|---|---|---|
| **1 — MVP comercializável** | Processo legislativo, gabinete digital, demandas do cidadão, protocolo, documentos, assinatura, painel da Presidência, IA para minutas | Primeiro contrato / piloto |
| **2 — Fiscalização Inteligente** | Conectores (SIM/TCE-CE, PNCP, portais), indicadores fiscais, contratos, obras, alertas, dossiês, requerimentos assistidos | Diferencial competitivo |
| **3 — Plenário e Orçamento** | Votação eletrônica, atas por IA, comissões, PPA/LDO/LOA, trilha de emendas | Ampliar ticket |
| **4 — Plataforma Nacional** | Apps, outros TCEs, IA avançada, expansão para outros estados | Escala |

Começar pelo **Ceará**: concentrar fontes de dados (SIM/TCE-CE), normas e necessidades comuns.

## Backlog técnico do MVP (ordem sugerida)
1. Núcleo: multi-tenant, autenticação com MFA, papéis/permissões, auditoria.
2. Cadastro institucional: Câmara, legislatura, parlamentares, mandatos, comissões, unidades.
3. Motor de ritos v1 (espécies, numeração, estados, prazos).
4. Protocolo e documentos com versionamento e assinatura.
5. Demandas do cidadão: registro (foto/geo), protocolo, encaminhamento, acompanhamento.
6. Gabinete: caixa de entrada, proposições, requerimentos ao Executivo.
7. Assistente IA: minutas de indicação/requerimento/ofício com RAG sobre normas locais.
8. Painel da Presidência.

## As quatro demonstrações de venda
1. **Vereador elabora um requerimento** — descreve o problema → IA gera minuta → revisa → assina → acompanha a tramitação.
2. **Cidadã registra uma demanda** — foto + localização → protocolo → encaminhamentos → resposta do Executivo vinculada.
3. **Fiscalização de um contrato** — obra com divergência potencial → fontes e cálculo → dossiê → minuta de diligência.
4. **Presidente acompanha a Casa** — uma tela: matérias, prazos, sessões, atendimentos, pendências.

O protótipo em `apps/web` cobre essas quatro histórias.

## Modelo comercial (hipótese — validar com pesquisa de preços)
| Plano | Mensal | Destaques |
|---|---|---|
| Essencial | R$ 2.490 | Processo legislativo, sessões, portal, gabinete básico, IA limitada |
| Profissional | R$ 4.990 | + Fiscalização, mapa, emendas (básico), gabinete completo |
| Premium | R$ 8.990 | + Orçamento completo, BI avançado, integrações sob escopo |

Contratação pública: observar planejamento, ETP, termo de referência e pesquisa de preços (Lei 14.133/2021). **Não presumir inexigibilidade** por ser software proprietário ou inovador.
