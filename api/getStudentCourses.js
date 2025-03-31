import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { userId } = req.query;

  console.log('🚀 API HIT: getStudentCourses');
  console.log('👉 userId received:', userId);

  if (!userId) {
    console.error('⛔ Missing userId parameter');
    return res.status(400).json({ error: 'Missing userId parameter' });
  }

  try {
    const parsedUserId = parseInt(userId);
    console.log('🔍 Parsed userId:', parsedUserId);

    const student = await prisma.student.findFirst({
        where: { userId: parsedUserId },
        include: {
          courses: {
            include: {
              exams: true, // include exam data
            },
          },
        },
      });

    if (!student) {
      console.error('❌ No student found for userId:', parsedUserId);
      return res.status(404).json({ error: 'Student not found' });
    }

    console.log('✅ Courses retrieved:', student.courses);
    return res.status(200).json(student.courses);
  } catch (error) {
    console.error('🔥 ERROR during Prisma query:');
    console.error(error); // Full stack trace
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
