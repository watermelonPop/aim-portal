-- CreateEnum
CREATE TYPE "RequesterRole" AS ENUM ('STUDENT', 'ADVISOR');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'APPROVED', 'DENIED');

-- CreateTable
CREATE TABLE "Student" (
    "userId" INTEGER NOT NULL,
    "studentId" TEXT NOT NULL,
    "major" TEXT,
    "graduationYear" INTEGER,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Professor" (
    "userId" INTEGER NOT NULL,
    "department" TEXT,
    "officeLocation" TEXT,

    CONSTRAINT "Professor_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Advisor" (
    "userId" INTEGER NOT NULL,
    "advisingDepartment" TEXT,
    "advisorNotes" TEXT,

    CONSTRAINT "Advisor_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "AccessibilityRequest" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "requestedBy" "RequesterRole" NOT NULL,
    "requestType" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccessibilityRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Student_userId_key" ON "Student"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_studentId_key" ON "Student"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Professor_userId_key" ON "Professor"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Advisor_userId_key" ON "Advisor"("userId");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Professor" ADD CONSTRAINT "Professor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Advisor" ADD CONSTRAINT "Advisor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessibilityRequest" ADD CONSTRAINT "AccessibilityRequest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
