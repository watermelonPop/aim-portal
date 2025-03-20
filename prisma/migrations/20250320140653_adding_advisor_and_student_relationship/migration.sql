-- CreateTable
CREATE TABLE "_AdvisorToStudent" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_AdvisorToStudent_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_AdvisorToStudent_B_index" ON "_AdvisorToStudent"("B");

-- AddForeignKey
ALTER TABLE "_AdvisorToStudent" ADD CONSTRAINT "_AdvisorToStudent_A_fkey" FOREIGN KEY ("A") REFERENCES "Advisor"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AdvisorToStudent" ADD CONSTRAINT "_AdvisorToStudent_B_fkey" FOREIGN KEY ("B") REFERENCES "Student"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
