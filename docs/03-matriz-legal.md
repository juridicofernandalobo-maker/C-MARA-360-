# 03 — Matriz de requisitos legais

> Documento vivo. Cada requisito deve ser rastreado até funcionalidade, teste e evidência.

| Base normativa | Requisito no sistema | Módulos |
|---|---|---|
| CF, arts. 29 a 31 | Competências municipais; controle externo pela Câmara com auxílio do TCE | 1, 2, 6 |
| CF, art. 37, caput e §1º | Impessoalidade e publicidade sem promoção pessoal: portal institucional, sem nomes/imagens com caráter promocional | 4, 11 |
| Lei Orgânica Municipal | Iniciativa, quóruns, competências — parametrizados no motor de ritos | 1, 5 |
| Regimento Interno | Tramitação, sessões, votações, comissões | 1, 5, 7 |
| LC 95/1998 | Técnica legislativa: estrutura de artigos, cláusula de vigência, revogação expressa — validação assistida | 1, 10 |
| LC 101/2000 (LRF) | Limites de pessoal (arts. 19-20), RGF/RREO, metas fiscais, transparência (art. 48 e 48-A) | 2, 6, 11 |
| Lei 4.320/1964 | Estrutura orçamentária, estágios da despesa (empenho, liquidação, pagamento) | 2, 6 |
| LC 141/2012 e CF art. 198 | Aplicação mínima em saúde (15%) | 2 |
| CF art. 212 e Lei 14.113/2020 | MDE (25%) e Fundeb | 2 |
| Lei 14.133/2021 | Contratações da Câmara; PNCP; contratação do próprio produto (ETP, TR, pesquisa de preços) | 8, 12 |
| Lei 12.527/2011 (LAI) | e-SIC, transparência ativa, dados abertos | 11 |
| Lei 13.460/2017 | Direitos do usuário, ouvidoria, carta de serviços | 4, 11 |
| Lei 13.709/2018 (LGPD) | Base legal por tratamento, minimização, finalidade, registro de operações, encarregado, RIPD | Todos |
| Lei 14.063/2020 | Níveis de assinatura eletrônica por tipo de ato | 1, 5, 8 |
| Lei 14.129/2021 | Referência de governo digital — aplicação a entes subnacionais depende de adoção | Todos |
| Lei 9.504/1997, art. 73 | Condutas vedadas: vedação de uso de bens, serviços e dados públicos em favor de candidato | 3, 4 |
| Lei 9.504/1997, art. 73, VI, "b" e §§ | Restrição à publicidade institucional nos 3 meses anteriores ao pleito — "modo período eleitoral" | 4, 11 |
| Lei 8.429/1992 | Improbidade: trilha de auditoria e segregação de funções | Todos |

## Controles específicos (eleitoral e impessoalidade)
- **Modo período eleitoral** configurável: suspende automaticamente publicações institucionais que possam caracterizar publicidade vedada, mantendo as de utilidade pública/legalmente obrigatórias.
- **Bloqueio de exportação** de dados pessoais de cidadãos atendidos pelos gabinetes; exportações apenas agregadas/anonimizadas e auditadas.
- **Isonomia entre parlamentares** na distribuição de demandas e no destaque no portal; algoritmo de priorização baseado em gravidade, urgência, impacto coletivo, competência e evidências — nunca em afinidade política.
- **Aviso ao cidadão**: indicação/requerimento não equivale à execução do serviço, que depende do órgão competente.

## Controles de IA
- Citação obrigatória de fonte em toda resposta normativa.
- Registro de quem revisou, o que alterou e quando.
- Nenhum documento gerado por IA adquire validade sem assinatura de autoridade competente.
- Proibição de linguagem imputativa ("fraude", "desvio") em achados automáticos.
