/*
  Warnings:

  - The `accommodations` column on the `Exam` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `name` on table `Exam` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Exam" DROP COLUMN "accommodations",
ADD COLUMN     "accommodations" TEXT[],
ALTER COLUMN "name" SET NOT NULL;
