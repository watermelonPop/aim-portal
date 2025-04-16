const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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

async function assignRandomAccommodationsToCourses() {
  // Fetch all accommodations
  const accommodations = await prisma.accommodations.findMany();
  if (accommodations.length < 3) {
    //console.log("Not enough accommodations available to assign at least 3 accommodations per course.");
    return;
  }

  // Fetch all courses
  const courses = await prisma.course.findMany();
  if (courses.length === 0) {
    //console.log("No courses found.");
    return;
  }

  // Iterate over each course
  for (const course of courses) {
    // Determine a random number of accommodations between 2 and 4 for this course
    const numAccommodations = getRandomInt(2, 4);

    // Shuffle the accommodations array and pick the first numAccommodations accommodations
    const selectedAccommodations = shuffleArray(accommodations).slice(0, numAccommodations);

    // Update the course to connect these accommodations
    await prisma.course.update({
      where: { id: course.id },
      data: {
        accommodations: {
          connect: selectedAccommodations.map(accommodation => ({ id: accommodation.id }))
        }
      }
    });

    //console.log(`Course ${course.id} connected to ${numAccommodations} accommodations.`);
  }
}

assignRandomAccommodationsToCourses()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
