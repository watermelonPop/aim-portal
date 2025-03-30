-- AlterTable
ALTER TABLE "Advisor" ADD COLUMN     "accessible_testing_modules" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "accomodation_modules" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "assistive_technology_modules" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "global_settings" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "note_taking_modules" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "student_case_information" BOOLEAN NOT NULL DEFAULT false;
