-- CreateTable
CREATE TABLE "Pessoa" (
    "id" BIGSERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "email" TEXT,
    "status" TEXT NOT NULL DEFAULT 'possivel lead',
    "classificacao" TEXT NOT NULL DEFAULT 'interessado',

    CONSTRAINT "Pessoa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Atendimentos" (
    "id" BIGSERIAL NOT NULL,
    "pessoaId" BIGINT NOT NULL,
    "dataLigacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atendente" TEXT NOT NULL,
    "statusLigacao" TEXT NOT NULL,
    "classificacao" TEXT NOT NULL DEFAULT 'nao atendeu',

    CONSTRAINT "Atendimentos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pessoa_telefone_key" ON "Pessoa"("telefone");

-- CreateIndex
CREATE UNIQUE INDEX "Pessoa_email_key" ON "Pessoa"("email");

-- CreateIndex
CREATE INDEX "Atendimentos_pessoaId_idx" ON "Atendimentos"("pessoaId");

-- AddForeignKey
ALTER TABLE "Atendimentos" ADD CONSTRAINT "Atendimentos_pessoaId_fkey" FOREIGN KEY ("pessoaId") REFERENCES "Pessoa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
