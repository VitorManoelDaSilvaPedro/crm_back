-- CreateTable
CREATE TABLE "public"."Etapa" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,
    "id_board" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Etapa_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Etapa" ADD CONSTRAINT "Etapa_id_board_fkey" FOREIGN KEY ("id_board") REFERENCES "public"."Board"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
