const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function assignNamesToExams() {
  // Fetch all exams and sort them by courseId
  const exams = await prisma.exam.findMany({
    orderBy: {
      courseId: 'asc' // Sorting exams by courseId
    }
  });

  const names = ["Exam 1", "Exam 2", "Exam 3"];
  let currCourse = null;
  let count = 0;

  for (const exam of exams) {
    //console.log(`currCourse: ${currCourse}, courseId: ${exam.courseId}`);
    
    if (currCourse === exam.courseId) {
      count += 1;
    } else {
      count = 0; // Reset counter when a new course is encountered
    }

    await prisma.exam.update({
      where: { id: exam.id },
      data: {
        name: names[count] || `Exam ${count + 1}` // Fallback if more than 3 exams exist
      }
    });

    currCourse = exam.courseId;
  }

  //console.log(`Added names for exams`);
}

assignNamesToExams()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });