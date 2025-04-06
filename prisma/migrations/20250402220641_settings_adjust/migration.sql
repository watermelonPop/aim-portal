/*
  Warnings:

  - You are about to drop the column `content_size` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `hide_images` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `highlight_tiles` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `reading_mask` on the `Settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Settings" DROP COLUMN "content_size",
DROP COLUMN "hide_images",
DROP COLUMN "highlight_tiles",
DROP COLUMN "reading_mask",
ADD COLUMN     "highlight_keyboard_focus" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "highlight_keyboard_focus_color" TEXT NOT NULL DEFAULT '#BD180F';
