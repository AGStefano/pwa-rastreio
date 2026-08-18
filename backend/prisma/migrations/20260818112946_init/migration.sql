-- CreateTable
CREATE TABLE "pedidos" (
    "id" INTEGER NOT NULL,
    "numero" INTEGER,
    "numero_ecommerce" TEXT,
    "data_pedido" TIMESTAMP(3),
    "data_faturamento" TIMESTAMP(3),
    "data_envio" TIMESTAMP(3),
    "data_entrega" TIMESTAMP(3),
    "situacao" TEXT,
    "nome_cliente" TEXT,
    "cpf_cnpj" TEXT,
    "cpf_cnpj_limpo" TEXT,
    "telefone" TEXT,
    "telefone_limpo" TEXT,
    "email" TEXT,
    "endereco_cobranca" JSONB,
    "endereco_entrega" JSONB,
    "valor_frete" DECIMAL(10,2),
    "forma_envio" TEXT,
    "forma_frete" TEXT,
    "url_rastreamento" TEXT,
    "codigo_rastreamento" TEXT,
    "id_nota_fiscal" INTEGER,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_control" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "last_synced_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sync_control_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pedidos_cpf_cnpj_limpo_idx" ON "pedidos"("cpf_cnpj_limpo");

-- CreateIndex
CREATE INDEX "pedidos_telefone_limpo_idx" ON "pedidos"("telefone_limpo");

-- CreateIndex
CREATE INDEX "pedidos_email_idx" ON "pedidos"("email");

-- CreateIndex
CREATE INDEX "pedidos_numero_ecommerce_idx" ON "pedidos"("numero_ecommerce");

-- CreateIndex
CREATE INDEX "pedidos_numero_idx" ON "pedidos"("numero");
