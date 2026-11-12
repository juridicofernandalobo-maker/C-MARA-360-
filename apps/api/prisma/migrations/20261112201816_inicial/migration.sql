-- CreateTable
CREATE TABLE "Camara" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "municipio" TEXT NOT NULL,
    "uf" CHAR(2) NOT NULL,
    "codigoIbge" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "exigirMfa" BOOLEAN NOT NULL DEFAULT true,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "regras" JSONB NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Camara_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Parlamentar" (
    "id" TEXT NOT NULL,
    "camaraId" TEXT NOT NULL,
    "nomeParlamentar" TEXT NOT NULL,
    "nomeCivil" TEXT NOT NULL,
    "partido" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Parlamentar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "camaraId" TEXT,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "papeis" TEXT[],
    "parlamentarId" TEXT,
    "mfaSecret" TEXT,
    "mfaAtivo" BOOLEAN NOT NULL DEFAULT false,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "ultimoLogin" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comissao" (
    "id" TEXT NOT NULL,
    "camaraId" TEXT NOT NULL,
    "sigla" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "permanente" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Comissao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EspecieNormativa" (
    "id" TEXT NOT NULL,
    "camaraId" TEXT NOT NULL,
    "sigla" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "ativa" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "EspecieNormativa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proposicao" (
    "id" TEXT NOT NULL,
    "camaraId" TEXT NOT NULL,
    "especieId" TEXT NOT NULL,
    "numero" INTEGER,
    "ano" INTEGER NOT NULL,
    "ementa" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "hashTexto" TEXT,
    "autorTipo" TEXT NOT NULL,
    "autorParlamentarId" TEXT,
    "autorDescricao" TEXT,
    "materias" TEXT[],
    "regime" TEXT NOT NULL DEFAULT 'ordinario',
    "estado" TEXT NOT NULL,
    "tramitacao" JSONB NOT NULL,
    "criadoPorId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "protocoladaEm" TIMESTAMP(3),

    CONSTRAINT "Proposicao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Movimentacao" (
    "id" TEXT NOT NULL,
    "camaraId" TEXT NOT NULL,
    "proposicaoId" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "dados" JSONB NOT NULL,
    "descricao" TEXT NOT NULL,
    "fundamento" TEXT,
    "estadoAnterior" TEXT NOT NULL,
    "estadoNovo" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Movimentacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Auditoria" (
    "id" BIGSERIAL NOT NULL,
    "camaraId" TEXT,
    "usuarioId" TEXT,
    "metodo" TEXT NOT NULL,
    "rota" TEXT NOT NULL,
    "status" INTEGER NOT NULL,
    "corpo" JSONB,
    "ip" TEXT,
    "em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Camara_slug_key" ON "Camara"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Camara_codigoIbge_key" ON "Camara"("codigoIbge");

-- CreateIndex
CREATE UNIQUE INDEX "Camara_cnpj_key" ON "Camara"("cnpj");

-- CreateIndex
CREATE INDEX "Parlamentar_camaraId_idx" ON "Parlamentar"("camaraId");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_camaraId_email_key" ON "Usuario"("camaraId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "Comissao_camaraId_sigla_key" ON "Comissao"("camaraId", "sigla");

-- CreateIndex
CREATE UNIQUE INDEX "EspecieNormativa_camaraId_sigla_key" ON "EspecieNormativa"("camaraId", "sigla");

-- CreateIndex
CREATE INDEX "Proposicao_camaraId_estado_idx" ON "Proposicao"("camaraId", "estado");

-- CreateIndex
CREATE UNIQUE INDEX "Proposicao_camaraId_especieId_ano_numero_key" ON "Proposicao"("camaraId", "especieId", "ano", "numero");

-- CreateIndex
CREATE INDEX "Movimentacao_proposicaoId_idx" ON "Movimentacao"("proposicaoId");

-- CreateIndex
CREATE INDEX "Auditoria_camaraId_em_idx" ON "Auditoria"("camaraId", "em");

-- AddForeignKey
ALTER TABLE "Parlamentar" ADD CONSTRAINT "Parlamentar_camaraId_fkey" FOREIGN KEY ("camaraId") REFERENCES "Camara"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_camaraId_fkey" FOREIGN KEY ("camaraId") REFERENCES "Camara"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_parlamentarId_fkey" FOREIGN KEY ("parlamentarId") REFERENCES "Parlamentar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comissao" ADD CONSTRAINT "Comissao_camaraId_fkey" FOREIGN KEY ("camaraId") REFERENCES "Camara"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EspecieNormativa" ADD CONSTRAINT "EspecieNormativa_camaraId_fkey" FOREIGN KEY ("camaraId") REFERENCES "Camara"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposicao" ADD CONSTRAINT "Proposicao_camaraId_fkey" FOREIGN KEY ("camaraId") REFERENCES "Camara"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposicao" ADD CONSTRAINT "Proposicao_especieId_fkey" FOREIGN KEY ("especieId") REFERENCES "EspecieNormativa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposicao" ADD CONSTRAINT "Proposicao_autorParlamentarId_fkey" FOREIGN KEY ("autorParlamentarId") REFERENCES "Parlamentar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimentacao" ADD CONSTRAINT "Movimentacao_proposicaoId_fkey" FOREIGN KEY ("proposicaoId") REFERENCES "Proposicao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
