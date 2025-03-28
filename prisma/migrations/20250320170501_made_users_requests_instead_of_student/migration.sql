/*
  Warnings:

  - You are about to drop the column `studentId` on the `Request` table. All the data in the column will be lost.
  - The `contrast` column on the `Settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `non_registered_userId` to the `Request` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Request" DROP CONSTRAINT "Request_studentId_fkey";

-- AlterTable
ALTER TABLE "Request" DROP COLUMN "studentId",
ADD COLUMN     "non_registered_userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Settings" ALTER COLUMN "align_text" SET DEFAULT 'Middle',
ALTER COLUMN "align_text" SET DATA TYPE TEXT,
DROP COLUMN "contrast",
ADD COLUMN     "contrast" TEXT NOT NULL DEFAULT '100%';

-- DropEnum
DROP TYPE "Contrast";

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_non_registered_userId_fkey" FOREIGN KEY ("non_registered_userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
