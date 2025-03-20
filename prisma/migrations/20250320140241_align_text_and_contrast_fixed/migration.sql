/*
  Warnings:

  - The `contrast` column on the `Settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Form" ADD COLUMN     "formUrl" TEXT;

-- AlterTable
ALTER TABLE "Settings" ALTER COLUMN "align_text" SET DEFAULT 'Middle',
ALTER COLUMN "align_text" SET DATA TYPE TEXT,
DROP COLUMN "contrast",
ADD COLUMN     "contrast" TEXT NOT NULL DEFAULT '100%';

-- DropEnum
DROP TYPE "Contrast";
