-- CreateEnum
CREATE TYPE "Font" AS ENUM ('Mitr', 'Lexend', 'Roboto', 'Montserrat', 'Lato', 'Nunito');

-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "font" "Font" NOT NULL DEFAULT 'Mitr';

-- DropEnum
DROP TYPE "Saturation";
