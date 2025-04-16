// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');
const prisma = new PrismaClient();

async function seed() {
  try {
    // Fetch the student with userId 1
    const student = await prisma.student.findUnique({
      where: { userId: 1 },
    });
    if (!student) {
      console.error('No student with userId 1 found.');
      return;
    }

    // Fetch advisors with userrole 1 (assuming "userrole" is a field on the Advisor model)
    const advisor = await prisma.advisor.findUnique({
      where: { userId: 651 },
    });
    if (advisor.length === 0) {
      console.error('No advisors with userrole 1 found.');
      return;
    }
    // Optionally, pick a random advisor from the filtered list:
    // const advisor = advisors[0];

    // Create 2 Accommodations records for student with userId 1 using the selected advisor
    //console.log('START Creating Accommodations');
    for (let i = 0; i < 2; i++) {
      await prisma.accommodations.create({
        data: {
          type: faker.helpers.arrayElement([
            "Extended Time", 
            "Note-Taking Assistance",
            "Alternative Format Materials",
            "Accessible Seating",
            "Reduced Distraction Testing Environment",
            "Use of Assistive Technology",
            "Interpreter Services",
            "Audio/Visual Aids",
            "Flexibility with Attendance",
            "Modified Assignments"
          ]),
          status: faker.helpers.arrayElement(['PENDING', 'APPROVED', 'DENIED']),
          advisorId: advisor.userId,
          studentId: student.userId,
          notes: faker.lorem.paragraph(),
        },
      });
    }
    //console.log('DONE Creating Accommodations');

    // Create 2 Assistive_Technology records for student with userId 1 using the selected advisor
    //console.log('START Creating Assistive Technologies');
    for (let i = 0; i < 2; i++) {
      await prisma.assistive_Technology.create({
        data: {
          available: faker.datatype.boolean(),
          studentId: student.userId,
          type: faker.helpers.arrayElement([
            "Screen Reader", 
            "Braille Writer", 
            "Smart Wheelchairs", 
            "Speech-to-Text/Text-to-Speech", 
            "Specialty Mouse and Keyboard", 
            "Smart Pens"
          ]),
          advisorId: advisor.userId,
        },
      });
    }
    //console.log('DONE Creating Assistive Technologies');
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
