const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Helper function to get a random integer between min and max (inclusive)
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Function to shuffle an array using Fisher-Yates algorithm
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = getRandomInt(0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function assignRandomCoursesToAllStudents() {
  // Fetch all courses
  const courses = await prisma.course.findMany();
  if (courses.length < 4) {
    //console.log("Not enough courses available to assign at least 4 courses per student.");
    return;
  }

  // Fetch all students
  const students = await prisma.student.findMany();
  if (students.length === 0) {
    //console.log("No students found.");
    return;
  }

  // Iterate over each student
  for (const student of students) {
    // Determine a random number of courses between 4 and 6 for this student
    const numCourses = getRandomInt(4, 6);

    // Shuffle the courses array and pick the first numCourses courses
    const selectedCourses = shuffleArray(courses).slice(0, numCourses);

    // Update the student to connect these courses
    await prisma.student.update({
      where: { userId: student.userId },
      data: {
        courses: {
          connect: selectedCourses.map(course => ({ id: course.id }))
        }
      }
    });

    //console.log(`Student ${student.userId} connected to ${numCourses} courses.`);
  }
}

assignRandomCoursesToAllStudents()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
