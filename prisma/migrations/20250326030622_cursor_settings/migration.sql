/*
  Warnings:

  - The `cursor` column on the `Settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "CursorSize" AS ENUM ('XLarge', 'Large', 'Regular');

-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "cursor_border" TEXT NOT NULL DEFAULT '#FFFFFF',
ADD COLUMN     "cursor_color" TEXT NOT NULL DEFAULT '#000000',
DROP COLUMN "cursor",
ADD COLUMN     "cursor" "CursorSize" NOT NULL DEFAULT 'Regular';

-- DropEnum
DROP TYPE "Cursor";
