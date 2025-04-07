import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId parameter' });
  }

  try {
    const professor = await prisma.professor.findUnique({
      where: { userId: parseInt(userId) },
      include: {
        courses: {
          include: {
            students: {
              include: {
                account: true,
              },
            },
            exams: true,
          },
        },
      },
    });
    
    // Flatten all students across courses
    const studentMap = new Map();
    
    for (const course of professor.courses) {
      for (const student of course.students) {
        if (!studentMap.has(student.userId)) {
          studentMap.set(student.userId, student);
        }
      }
    }
    
    const allStudents = Array.from(studentMap.values());
    
    res.status(200).json({
      courses: professor.courses,
      students: allStudents,
    });
  } catch (error) {
    console.error('Error fetching student data:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
