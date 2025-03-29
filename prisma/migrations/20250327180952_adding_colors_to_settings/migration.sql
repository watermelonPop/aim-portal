-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "background_color" TEXT NOT NULL DEFAULT '#FFEDED',
ADD COLUMN     "foreground_color" TEXT NOT NULL DEFAULT '#4F0000',
ADD COLUMN     "text_color" TEXT NOT NULL DEFAULT '#000000';
