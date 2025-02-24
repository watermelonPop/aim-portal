import { PrismaClient } from "@prisma/client";
import faker from "faker";

const prisma = new PrismaClient();

async function seed() {
  try {
    console.log("Seeding database...");

    // Create Students
    for (let i = 0; i < 10; i++) {
      await prisma.user.create({
        data: {
          name: faker.name.findName(),
          email: faker.internet.email(),
          phone: faker.phone.phoneNumber(),
          role: "STUDENT",
          student: {
            create: {
              studentId: `S${faker.datatype.number(10000)}`,
              major: faker.commerce.department(),
              graduationYear: faker.datatype.number({ min: 2024, max: 2030 }),
            },
          },
        },
      });
    }

    // Create Professors
    for (let i = 0; i < 5; i++) {
      await prisma.user.create({
        data: {
          name: faker.name.findName(),
          email: faker.internet.email(),
          phone: faker.phone.phoneNumber(),
          role: "PROFESSOR",
          professor: {
            create: {
              department: faker.commerce.department(),
              officeLocation: `Room ${faker.datatype.number(200)}`,
            },
          },
        },
      });
    }

    // Create Advisors
    for (let i = 3; i < 6; i++) {
      await prisma.user.create({
        data: {
          name: faker.name.findName(),
          email: faker.internet.email(),
          phone: faker.phone.phoneNumber(),
          role: "ADVISOR",
          advisor: {
            create: {
              advisingDepartment: faker.commerce.department(),
              advisorNotes: faker.lorem.sentence(),
            },
          },
        },
      });
    }

    console.log("✅ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
