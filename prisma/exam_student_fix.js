const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function assignStudentsToExams() {
  // Fetch all exams with their associated course and students
  const exams = await prisma.exam.findMany({
    include: {
      course: {
        include: {
          students: true, // Get students in the course
        },
      },
    },
  });

  for (const exam of exams) {
    const students = exam.course.students;
    // console.log(students[0]);

    if (students.length > 0) {
      // Select a random student from the course
      const randomStudent = students[Math.floor(Math.random() * students.length)];
    //   console.log(randomStudent);

      // Update exam with the randomly chosen student's ID
      await prisma.exam.update({
        where: { id: exam.id },
        data: {
          studentIds: [randomStudent.userId], // Ensure it's an array
        },
      });

      console.log(`Updated Exam ${exam.id} with Student ${randomStudent.userId}`);
    } else {
      console.log(`No students found for Exam ${exam.id}, skipping.`);
    }
  }

  console.log("Random student assignment completed.");
}

assignStudentsToExams()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
