/*
  Warnings:

  - Added the required column `id_departamento` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- Add column as nullable first
ALTER TABLE "public"."Usuario" ADD COLUMN "id_departamento" TEXT;

-- Update existing users with first department ID
UPDATE "public"."Usuario" 
SET "id_departamento" = (SELECT id FROM "public"."Departamento" LIMIT 1)
WHERE "id_departamento" IS NULL;

-- Make column NOT NULL
ALTER TABLE "public"."Usuario" ALTER COLUMN "id_departamento" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Usuario" ADD CONSTRAINT "Usuario_id_departamento_fkey" FOREIGN KEY ("id_departamento") REFERENCES "public"."Departamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
