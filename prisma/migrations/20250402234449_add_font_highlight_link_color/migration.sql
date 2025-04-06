-- AlterEnum
ALTER TYPE "Font" ADD VALUE 'Arimo';

-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "highlight_links_color" TEXT NOT NULL DEFAULT '#FFFF8F';
