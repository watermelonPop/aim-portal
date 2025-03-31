-- CreateTable
CREATE TABLE "_AccommodationsToCourse" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_AccommodationsToCourse_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_AccommodationsToCourse_B_index" ON "_AccommodationsToCourse"("B");

-- AddForeignKey
ALTER TABLE "_AccommodationsToCourse" ADD CONSTRAINT "_AccommodationsToCourse_A_fkey" FOREIGN KEY ("A") REFERENCES "Accommodations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccommodationsToCourse" ADD CONSTRAINT "_AccommodationsToCourse_B_fkey" FOREIGN KEY ("B") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
