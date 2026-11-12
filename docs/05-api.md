# 05 — API do MVP

Base: `http://localhost:3000/api`. Autenticação por token (`Authorization: Bearer <token>`).

## Perfis de acesso

| Papel | Quem é | Pode |
|---|---|---|
| `plataforma` | Equipe do Câmara 360º | Criar e listar Câmaras. **Não** acessa dados internos de nenhuma Câmara. |
| `administrador` | TI / Diretoria da Câmara | Usuários, parlamentares, comissões, configuração regimental, auditoria |
| `presidente` | Presidente da Câmara | Configuração regimental, usuários, auditoria, atos da Mesa, promulgação |
| `mesa` | Membros da Mesa Diretora | Configuração regimental, atos de tramitação, promulgação |
| `vereador` | Parlamentar | Criar, editar rascunho, protocolar e retirar **as próprias** proposições |
| `assessor` | Assessor de gabinete | O mesmo que o vereador, **apenas** em nome do parlamentar ao qual está vinculado |
| `servidor` | Secretaria Legislativa | Protocolar matérias do Executivo e populares; registrar leitura, distribuição, pareceres, pauta, votação, sanção/veto, publicação |
| `procurador` | Procuradoria | Consulta (pareceres jurídicos virão na próxima etapa) |

Um usuário pode acumular papéis (ex.: presidente que também é vereador).

## Segurança implementada

- Senhas com bcrypt; mínimo de 10 caracteres.
- **Autenticação em dois fatores (TOTP)** — compatível com Google Authenticator, Microsoft Authenticator etc. Obrigatória para a plataforma; para as Câmaras, controlada por `exigirMfa` (padrão: ligada). Sem MFA ativo, o token só permite cadastrar o segundo fator.
- Limite de tentativas de login por IP (padrão: 10/minuto).
- Mensagem de erro de login genérica (não revela se o e-mail existe).
- **Isolamento entre Câmaras**: toda consulta é filtrada pela Câmara do usuário; recurso de outra Câmara responde "não encontrado".
- **Trilha de auditoria** de toda operação de escrita, inclusive as recusadas, com senhas e códigos omitidos.
- **Integridade documental**: no protocolo, o texto recebe hash SHA-256 e deixa de ser editável.
- Concorrência: duas pessoas não conseguem movimentar a mesma proposição ao mesmo tempo; a numeração é atribuída com bloqueio, sem lacunas nem duplicidade.

## Endpoints

| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/login` | `{ camara, email, senha, codigo? }` → token |
| GET | `/auth/eu` | Dados do usuário autenticado |
| POST | `/auth/mfa/iniciar` | Gera segredo e link `otpauth://` (para QR Code) |
| POST | `/auth/mfa/confirmar` | `{ codigo }` ativa o MFA |
| POST | `/auth/senha` | `{ senhaAtual, novaSenha }` |
| POST | `/camaras` | (plataforma) Cria Câmara com modelo de ritos e administrador inicial |
| GET | `/camaras` | (plataforma) Lista Câmaras |
| GET | `/camaras/atual` | Câmara do usuário, com regras, espécies e comissões |
| PUT | `/camaras/atual/regras` | Regras gerais da Casa (quóruns, prazos, feriados, iniciativa privativa) |
| PUT | `/camaras/atual/especies/:sigla` | Configura uma espécie de proposição |
| POST | `/camaras/atual/comissoes` | Cadastra comissão |
| GET/POST/PATCH | `/parlamentares` | Cadastro de parlamentares |
| GET/POST/PATCH | `/usuarios` | Cadastro de usuários e papéis |
| GET/POST | `/proposicoes` | Lista (filtros `estado`, `especie`) / cria rascunho |
| GET/PATCH | `/proposicoes/:id` | Detalhe (com `acoesPossiveis`, `alertas`, histórico) / edita rascunho |
| POST | `/proposicoes/:id/acoes` | Executa ato de tramitação (ver abaixo) |
| GET | `/auditoria` | Trilha de auditoria da Câmara |

## Atos de tramitação (`POST /proposicoes/:id/acoes`)

`data` é opcional (padrão: hoje, fuso de Fortaleza).

```json
{ "tipo": "protocolar" }
{ "tipo": "ler", "data": "2026-11-13" }
{ "tipo": "distribuir" }
{ "tipo": "registrar_parecer", "comissao": "CCJ", "sentido": "favoravel" }
{ "tipo": "incluir_pauta" }
{ "tipo": "votar", "votos": { "presentes": 9, "sim": 6, "nao": 3, "abstencao": 0 } }
{ "tipo": "aprovar_redacao_final" }
{ "tipo": "enviar_sancao" }
{ "tipo": "sancionar" }
{ "tipo": "vetar", "parcial": false }
{ "tipo": "registrar_sancao_tacita" }
{ "tipo": "apreciar_veto", "votos": { "presentes": 10, "sim": 6, "nao": 4, "abstencao": 0 } }
{ "tipo": "promulgar" }
{ "tipo": "publicar" }
{ "tipo": "encaminhar_executivo" }
{ "tipo": "retirar" }
{ "tipo": "arquivar", "motivo": "Prejudicada" }
```

Quando o rito não permite o ato, a resposta é **422** com a lista de impedimentos, por exemplo:

```json
{ "message": "Ação recusada pelo rito.", "erros": ["Vício de iniciativa: matéria(s) cargos_executivo de iniciativa privativa de \"prefeito\"."] }
```

## Usuários de demonstração (seed)

Câmara `vale-verde`, senha `Camara360@demo`:

| E-mail | Papéis |
|---|---|
| admin@valeverde.dev | administrador |
| presidente@valeverde.dev | presidente, mesa, vereador |
| ana@valeverde.dev | vereador |
| assessor.ana@valeverde.dev | assessor (gabinete da Ana) |
| secretaria@valeverde.dev | servidor |
| procuradoria@valeverde.dev | procurador |

Plataforma: `plataforma@camara360.dev` (sem `camara` no login; exige MFA).
