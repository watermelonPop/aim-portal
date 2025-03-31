/*
  Warnings:

  - You are about to drop the column `advisingDepartment` on the `Advisor` table. All the data in the column will be lost.
  - You are about to drop the column `advisorNotes` on the `Advisor` table. All the data in the column will be lost.
  - You are about to drop the column `officeLocation` on the `Professor` table. All the data in the column will be lost.
  - You are about to drop the column `graduationYear` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `major` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the `AccessibilityRequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[UIN]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `dob` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone_number` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FormStatus" AS ENUM ('OVERDUE', 'PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "FormType" AS ENUM ('REGISTRATION_ELIGIBILITY', 'ACADEMIC_CLASSROOM', 'CAMPUS_LIVING_MOBILITY', 'APPEALS_TEMP_WORKPLACE');

-- CreateEnum
CREATE TYPE "Cursor" AS ENUM ('BBC', 'BWC', 'Regular');

-- CreateEnum
CREATE TYPE "Saturation" AS ENUM ('Regular', 'Low', 'High', 'Monochrome');

-- CreateEnum
CREATE TYPE "Contrast" AS ENUM ('Regular', 'Dark', 'Light', 'Monochrome');

-- CreateEnum
CREATE TYPE "AdvisorRoles" AS ENUM ('Admin', 'Coordinator', 'Testing_Staff', 'Tech_Staff');

-- DropForeignKey
ALTER TABLE "AccessibilityRequest" DROP CONSTRAINT "AccessibilityRequest_studentId_fkey";

-- DropForeignKey
ALTER TABLE "Advisor" DROP CONSTRAINT "Advisor_userId_fkey";

-- DropForeignKey
ALTER TABLE "Professor" DROP CONSTRAINT "Professor_userId_fkey";

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_userId_fkey";

-- DropIndex
DROP INDEX "Student_studentId_key";

-- AlterTable
ALTER TABLE "Advisor" DROP COLUMN "advisingDepartment",
DROP COLUMN "advisorNotes",
ADD COLUMN     "role" "AdvisorRoles" NOT NULL DEFAULT 'Coordinator';

-- AlterTable
ALTER TABLE "Professor" DROP COLUMN "officeLocation";

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "graduationYear",
DROP COLUMN "major",
DROP COLUMN "studentId",
ADD COLUMN     "UIN" INTEGER,
ADD COLUMN     "dob" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "phone_number" TEXT NOT NULL;

-- DropTable
DROP TABLE "AccessibilityRequest";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Account" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "userId" INTEGER NOT NULL,
    "content_size" INTEGER NOT NULL DEFAULT 100,
    "highlight_tiles" BOOLEAN NOT NULL DEFAULT false,
    "highlight_links" BOOLEAN NOT NULL DEFAULT false,
    "text_magnifier" BOOLEAN NOT NULL DEFAULT false,
    "align_text" BOOLEAN NOT NULL DEFAULT false,
    "font_size" INTEGER NOT NULL DEFAULT 100,
    "line_height" INTEGER NOT NULL DEFAULT 100,
    "letter_spacing" INTEGER NOT NULL DEFAULT 100,
    "contrast" "Contrast" NOT NULL DEFAULT 'Regular',
    "saturation" "Saturation" NOT NULL DEFAULT 'Regular',
    "mute_sounds" BOOLEAN NOT NULL DEFAULT false,
    "hide_images" BOOLEAN NOT NULL DEFAULT false,
    "reading_mask" BOOLEAN NOT NULL DEFAULT false,
    "highlight_hover" BOOLEAN NOT NULL DEFAULT false,
    "cursor" "Cursor" NOT NULL DEFAULT 'Regular',

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Form" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "FormType" NOT NULL,
    "status" "FormStatus" NOT NULL DEFAULT 'PENDING',
    "submittedDate" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Form_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Important_Dates" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Important_Dates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Testing_Room" (
    "id" SERIAL NOT NULL,
    "location" TEXT NOT NULL DEFAULT 'Student Services Building',
    "available" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Testing_Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assistive_Technology" (
    "id" SERIAL NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT false,
    "studentId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "advisorId" INTEGER NOT NULL,

    CONSTRAINT "Assistive_Technology_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Accommodations" (
    "id" SERIAL NOT NULL,
    "type" TEXT,
    "status" TEXT NOT NULL,
    "date_requested" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "advisorId" INTEGER NOT NULL,
    "notes" TEXT NOT NULL,

    CONSTRAINT "Accommodations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Request" (
    "id" INTEGER NOT NULL,
    "advisorId" INTEGER NOT NULL,
    "notes" TEXT,
    "documentation" BOOLEAN NOT NULL,

    CONSTRAINT "Request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "professorId" INTEGER NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exam" (
    "id" SERIAL NOT NULL,
    "courseId" INTEGER NOT NULL,
    "date" TIMESTAMP(3),
    "location" TEXT NOT NULL,
    "advisorId" INTEGER NOT NULL,

    CONSTRAINT "Exam_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Settings_userId_key" ON "Settings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Request_id_key" ON "Request"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Request_advisorId_key" ON "Request"("advisorId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_UIN_key" ON "Student"("UIN");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Professor" ADD CONSTRAINT "Professor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Advisor" ADD CONSTRAINT "Advisor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settings" ADD CONSTRAINT "Settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Form" ADD CONSTRAINT "Form_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assistive_Technology" ADD CONSTRAINT "Assistive_Technology_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assistive_Technology" ADD CONSTRAINT "Assistive_Technology_advisorId_fkey" FOREIGN KEY ("advisorId") REFERENCES "Advisor"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Accommodations" ADD CONSTRAINT "Accommodations_advisorId_fkey" FOREIGN KEY ("advisorId") REFERENCES "Advisor"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_id_fkey" FOREIGN KEY ("id") REFERENCES "Student"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_advisorId_fkey" FOREIGN KEY ("advisorId") REFERENCES "Advisor"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "Professor"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_advisorId_fkey" FOREIGN KEY ("advisorId") REFERENCES "Advisor"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
