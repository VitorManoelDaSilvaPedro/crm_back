-- CreateTable
CREATE TABLE "public"."Departamento" (
    "id" TEXT NOT NULL,
    "icone" TEXT,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Departamento_pkey" PRIMARY KEY ("id")
);
