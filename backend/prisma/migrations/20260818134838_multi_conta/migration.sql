-- CreateEnum
CREATE TYPE "OrigemPedido" AS ENUM ('filamento', 'impressora');

-- pedidos: adiciona tiny_id + origem (nullable pra poder popular os dados existentes antes de travar NOT NULL)
ALTER TABLE "pedidos" ADD COLUMN "tiny_id" INTEGER;
ALTER TABLE "pedidos" ADD COLUMN "origem" "OrigemPedido";

-- Dados existentes eram todos sincronizados só com a conta de filamentos:
-- o id do Tiny vira tiny_id, e a origem é marcada como filamento.
UPDATE "pedidos" SET "tiny_id" = "id", "origem" = 'filamento';

ALTER TABLE "pedidos" ALTER COLUMN "tiny_id" SET NOT NULL;
ALTER TABLE "pedidos" ALTER COLUMN "origem" SET NOT NULL;

ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_tiny_id_origem_key" UNIQUE ("tiny_id", "origem");

-- "id" deixa de ser o id do Tiny e passa a ser sequencial interno nosso.
-- Os valores existentes são preservados; a sequência começa depois do maior id atual
-- pra não colidir com os pedidos já sincronizados.
CREATE SEQUENCE IF NOT EXISTS "pedidos_id_seq" OWNED BY "pedidos"."id";
SELECT setval('pedidos_id_seq', COALESCE((SELECT MAX("id") FROM "pedidos"), 0) + 1, false);
ALTER TABLE "pedidos" ALTER COLUMN "id" SET DEFAULT nextval('pedidos_id_seq');

-- sync_control: uma linha por conta (origem) em vez de uma linha fixa (id = 1).
ALTER TABLE "sync_control" ADD COLUMN "origem" "OrigemPedido";
UPDATE "sync_control" SET "origem" = 'filamento' WHERE "id" = 1;

ALTER TABLE "sync_control" DROP CONSTRAINT "sync_control_pkey";
ALTER TABLE "sync_control" ALTER COLUMN "origem" SET NOT NULL;
ALTER TABLE "sync_control" ADD CONSTRAINT "sync_control_pkey" PRIMARY KEY ("origem");
ALTER TABLE "sync_control" DROP COLUMN "id";

-- Garante que a segunda conta já tenha uma linha de controle (sem data = sincroniza
-- desde SYNC_INITIAL_DATE na primeira execução).
INSERT INTO "sync_control" ("origem", "last_synced_at", "updated_at")
VALUES ('impressora', NULL, CURRENT_TIMESTAMP)
ON CONFLICT ("origem") DO NOTHING;
