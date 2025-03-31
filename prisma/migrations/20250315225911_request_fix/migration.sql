/*
  Warnings:

  - Added the required column `studentId` to the `Request` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Request" DROP CONSTRAINT "Request_id_fkey";

-- DropIndex
DROP INDEX "Request_advisorId_key";

-- DropIndex
DROP INDEX "Request_id_key";

-- AlterTable
CREATE SEQUENCE request_id_seq;
ALTER TABLE "Request" ADD COLUMN     "studentId" INTEGER NOT NULL,
ALTER COLUMN "id" SET DEFAULT nextval('request_id_seq');
ALTER SEQUENCE request_id_seq OWNED BY "Request"."id";

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
