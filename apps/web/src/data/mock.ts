// Dados 100% fictícios para demonstração. Município: "Vale Verde/CE".
export const camara = { nome: 'Câmara Municipal de Vale Verde', uf: 'CE', cadeiras: 11 }

export const vereadores = [
  'Ana Ribeiro', 'Bruno Castro', 'Carla Menezes', 'Davi Nogueira', 'Elisa Prado', 'Fábio Lima',
  'Gabriela Sousa', 'Heitor Alves', 'Íris Monteiro', 'João Pedro Sales', 'Karina Feitosa',
]

export type Proposicao = {
  id: string; especie: string; numero: string; ementa: string; autor: string
  etapa: number; prazo: string; atrasada?: boolean
}
export const etapas = ['Protocolo', 'Leitura', 'Comissões', 'Pauta', 'Votação', 'Redação final', 'Sanção/Promulgação', 'Publicação']

export const proposicoes: Proposicao[] = [
  { id: 'p1', especie: 'PLO', numero: '45/2026', ementa: 'Institui o Programa Municipal de Iluminação Pública Eficiente.', autor: 'Ana Ribeiro', etapa: 2, prazo: '20/11/2026' },
  { id: 'p2', especie: 'PLO', numero: '47/2026', ementa: 'Dispõe sobre transparência das rotas do transporte escolar.', autor: 'Davi Nogueira', etapa: 4, prazo: '14/11/2026' },
  { id: 'p3', especie: 'PLC', numero: '08/2026', ementa: 'Altera o Código Tributário Municipal quanto ao ISS de microempresas.', autor: 'Poder Executivo', etapa: 2, prazo: '10/11/2026', atrasada: true },
  { id: 'p4', especie: 'PR', numero: '12/2026', ementa: 'Cria a Frente Parlamentar da Primeira Infância.', autor: 'Elisa Prado', etapa: 5, prazo: '18/11/2026' },
  { id: 'p5', especie: 'IND', numero: '231/2026', ementa: 'Indica a recuperação da iluminação da Rua das Flores, Bairro Centro.', autor: 'Ana Ribeiro', etapa: 7, prazo: '—' },
  { id: 'p6', especie: 'REQ', numero: '118/2026', ementa: 'Requer informações sobre o contrato de pavimentação nº 032/2025.', autor: 'Fábio Lima', etapa: 6, prazo: '25/11/2026' },
  { id: 'p7', especie: 'PELO', numero: '02/2026', ementa: 'Altera o art. 54 da Lei Orgânica (iniciativa popular).', autor: 'Mesa Diretora', etapa: 2, prazo: '30/11/2026' },
]

export type Nivel = 'alerta' | 'inconsistencia' | 'indicio' | 'conclusao'
export const nivelLabel: Record<Nivel, string> = {
  alerta: 'Alerta', inconsistencia: 'Inconsistência', indicio: 'Indício', conclusao: 'Conclusão formal',
}
export type Alerta = {
  id: string; area: string; nivel: Nivel; titulo: string; detalhe: string
  regra: string; fontes: string[]; calculo: string[]; perguntas: string[]
}
export const alertas: Alerta[] = [
  {
    id: 'a1', area: 'Obras', nivel: 'inconsistencia',
    titulo: 'Pavimentação – Contrato 032/2025: pagamento acima da medição registrada',
    detalhe: 'Valor pago acumulado supera em 18,4% o valor das medições publicadas.',
    regra: 'Pagamentos acumulados > medições acumuladas publicadas',
    fontes: ['SIM/TCE-CE — empenhos e pagamentos (extração 05/11/2026)', 'Portal da Transparência — medições 1 a 4', 'PNCP — extrato do contrato 032/2025'],
    calculo: ['Valor do contrato: R$ 1.850.000,00', 'Medições publicadas (1–4): R$ 812.400,00', 'Pagamentos liquidados: R$ 961.900,00', 'Diferença: R$ 149.500,00 (18,4%)'],
    perguntas: ['Existe medição nº 5 ainda não publicada?', 'Houve adiantamento previsto contratualmente (Lei 14.133/2021, art. 145)?', 'Qual o percentual físico executado segundo a fiscalização do contrato?'],
  },
  {
    id: 'a2', area: 'Obras', nivel: 'alerta',
    titulo: 'Creche Bairro Esperança: 120 dias sem nova medição',
    detalhe: 'Última medição em 14/07/2026; cronograma previa medições mensais.',
    regra: 'Obra em execução sem medição há mais de 90 dias',
    fontes: ['Portal da Transparência — obras', 'SIM/TCE-CE — contratos'],
    calculo: ['Última medição: 14/07/2026', 'Dias decorridos até 11/11/2026: 120'],
    perguntas: ['A obra está paralisada? Há ordem de paralisação formal?', 'Qual o percentual físico executado?'],
  },
  {
    id: 'a3', area: 'Pessoal', nivel: 'alerta',
    titulo: 'Despesa com pessoal do Executivo em 51,9% da RCL (acima do prudencial)',
    detalhe: 'Acima do limite prudencial (51,3%) e abaixo do máximo (54%).',
    regra: 'DTP/RCL ≥ 95% do limite máximo (LRF, art. 22, parágrafo único)',
    fontes: ['RGF 2º quadrimestre/2026 — Siconfi'],
    calculo: ['DTP: R$ 41,52 mi', 'RCL: R$ 80,00 mi', '41,52 / 80,00 = 51,9%', 'Limite prudencial (95%): 51,3% · Máximo: 54%'],
    perguntas: ['Quais medidas do art. 22, parágrafo único, da LRF foram adotadas?'],
  },
  {
    id: 'a4', area: 'Licitações', nivel: 'alerta',
    titulo: 'Contrato de merenda escolar vence em 28 dias',
    detalhe: 'Sem processo de nova contratação localizado no PNCP.',
    regra: 'Vigência < 30 dias e sem novo processo publicado',
    fontes: ['PNCP — contratos e editais'],
    calculo: ['Fim da vigência: 09/12/2026'],
    perguntas: ['Há prorrogação ou nova licitação em andamento?'],
  },
  {
    id: 'a5', area: 'Educação', nivel: 'alerta',
    titulo: 'Aplicação em MDE em 21,7% até o 5º bimestre',
    detalhe: 'Mínimo constitucional anual é 25% (CF, art. 212). Ritmo exige atenção.',
    regra: 'Projeção anual de MDE < 25%',
    fontes: ['RREO 5º bimestre/2026 — Anexo 8'],
    calculo: ['Aplicado: R$ 13,02 mi', 'Receita base: R$ 60,00 mi', '13,02 / 60,00 = 21,7%'],
    perguntas: ['Qual a programação de despesas em MDE para o último bimestre?'],
  },
]

export type Demanda = {
  protocolo: string; assunto: string; bairro: string; status: number; data: string
  gabinete?: string; x: number; y: number; resposta?: string
}
export const statusDemanda = ['Recebida', 'Em análise', 'Encaminhada', 'Respondida', 'Concluída']
export const demandas: Demanda[] = [
  { protocolo: '2026-001842', assunto: 'Iluminação pública', bairro: 'Centro', status: 3, data: '22/10/2026', gabinete: 'Ana Ribeiro', x: 48, y: 46, resposta: 'Secretaria de Infraestrutura informa troca das luminárias prevista para 20/11.' },
  { protocolo: '2026-001850', assunto: 'Transporte escolar', bairro: 'Sítio Lagoa', status: 2, data: '24/10/2026', gabinete: 'Davi Nogueira', x: 18, y: 22 },
  { protocolo: '2026-001861', assunto: 'Buraco na via', bairro: 'Esperança', status: 1, data: '28/10/2026', x: 70, y: 64 },
  { protocolo: '2026-001870', assunto: 'Transporte escolar', bairro: 'Sítio Lagoa', status: 1, data: '30/10/2026', x: 21, y: 26 },
  { protocolo: '2026-001877', assunto: 'Saúde – falta de médico no posto', bairro: 'Alto Alegre', status: 2, data: '01/11/2026', gabinete: 'Karina Feitosa', x: 78, y: 28 },
  { protocolo: '2026-001881', assunto: 'Transporte escolar', bairro: 'Sítio Lagoa', status: 0, data: '03/11/2026', x: 15, y: 30 },
  { protocolo: '2026-001890', assunto: 'Iluminação pública', bairro: 'Esperança', status: 0, data: '05/11/2026', x: 66, y: 70 },
  { protocolo: '2026-001894', assunto: 'Coleta de lixo', bairro: 'Centro', status: 4, data: '06/11/2026', gabinete: 'Bruno Castro', x: 52, y: 52 },
  { protocolo: '2026-001899', assunto: 'Buraco na via', bairro: 'Alto Alegre', status: 0, data: '09/11/2026', x: 82, y: 34 },
]

export const obras = [
  { nome: 'Creche Bairro Esperança', x: 68, y: 66, situacao: 'Sem medição há 120 dias' },
  { nome: 'Pavimentação Av. Central', x: 50, y: 40, situacao: 'Em execução' },
  { nome: 'UBS Alto Alegre (reforma)', x: 80, y: 30, situacao: 'Licitação' },
]
