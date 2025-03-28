/*
  Warnings:

  - You are about to drop the column `cursor` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `cursor_border` on the `Settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Settings" DROP COLUMN "cursor",
DROP COLUMN "cursor_border",
ADD COLUMN     "cursor_border_color" TEXT NOT NULL DEFAULT '#FFFFFF',
ADD COLUMN     "cursor_size" INTEGER NOT NULL DEFAULT 2;

-- DropEnum
DROP TYPE "CursorSize";
