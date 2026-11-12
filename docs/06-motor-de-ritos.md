# 06 — Motor de ritos legislativos

Pacote: `packages/rito`. Código puro, sem banco de dados, testável isoladamente. É a peça que permite que **cada Câmara siga a própria Lei Orgânica e o próprio Regimento**, sem que o rito de um município seja aplicado a outro.

## Como funciona

```
EspecieConfig (por espécie)  ┐
RegrasCasa (por Câmara)      ├──► aplicar(...) ──► nova Tramitação + descrição + fundamento
Tramitacao (estado atual)    │                 └─► ou lista de impedimentos
Acao (ato praticado)         ┘
```

A função `aplicar` não grava nada: devolve o resultado, e a API decide persistir. Isso permite simular um rito ("o que acontece se…") sem efeitos colaterais.

## O que é verificado

| Regra | Origem típica |
|---|---|
| Iniciativa por espécie (ex.: Prefeito não apresenta Projeto de Resolução) | LOM / RI |
| **Iniciativa privativa por matéria** (cargos e estrutura do Executivo, orçamento → Prefeito; cargos da Câmara → Mesa) | Simetria com CF, arts. 61, §1º, 165, 51, IV e 52, XIII |
| Leitura obrigatória no Expediente | RI |
| Pareceres de todas as comissões competentes, sem duplicidade | RI |
| Prazo de parecer em dias úteis (feriados locais) e redução em urgência | RI |
| Inclusão em pauta sem parecer só após o prazo, se o RI permitir | RI |
| Quórum de presença para deliberar | LOM |
| Quórum de aprovação: simples, absoluta (sobre o total de membros) ou 2/3 | LOM; CF, art. 29 (emenda à LOM) |
| Dois turnos com interstício mínimo | CF, art. 29, caput |
| Sanção × promulgação conforme a espécie | LOM |
| Prazo de sanção, veto intempestivo e sanção tácita | Simetria com CF, art. 66, §§1º e 3º |
| Rejeição de veto por maioria absoluta | Simetria com CF, art. 66, §4º |
| Indicação: leitura e encaminhamento, sem votação | RI |
| Moção e requerimento não têm redação final | RI |

## Modelo de partida

`modelo-padrao.ts` traz 8 espécies (PLO, PLC, PELO, PR, PDL, IND, REQ, MOC) com regras **frequentes**, não universais. Na implantação, cada parâmetro deve ser conferido com a LOM e o RI locais — esse é um serviço de parametrização a ser oferecido no contrato.

## Pontos a validar juridicamente

- Classificação de matérias de iniciativa privativa: a lista é exemplificativa e deve refletir a LOM e a jurisprudência do TJCE/STF (ex.: Tema 917 de Repercussão Geral — lei de iniciativa parlamentar que cria despesa sem tratar da estrutura ou atribuição de órgãos não usurpa competência privativa).
- Voto do Presidente (desempate × quórum qualificado): ainda não parametrizado.
- Prazo de sanção em dias úteis × corridos e prazo de promulgação após rejeição do veto (48 horas, por simetria): ainda não parametrizados.
- Emendas, substitutivos, destaques, pedido de vista, adiamento e urgência urgentíssima: próximas versões.
