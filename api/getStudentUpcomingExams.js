import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { userId } = req.query;

  //console.log('🚀 API HIT: getStudentUpcomingExams');
  //console.log('👉 userId received:', userId);

  if (!userId) {
    console.error('⛔ Missing userId parameter');
    return res.status(400).json({ error: 'Missing userId parameter' });
  }

  try {
    const parsedUserId = parseInt(userId);
    //console.log('🔍 Parsed userId:', parsedUserId);

    // Find the student and include their courses and the exams within each course.
    const student = await prisma.student.findUnique({
      where: { userId: parsedUserId },
      include: {
        courses: {
          include: {
            exams: true,
          },
        },
      },
    });

    if (!student) {
      console.error('❌ No student found for userId:', parsedUserId);
      return res.status(404).json({ error: 'Student not found' });
    }

    const now = new Date();
    let upcomingExams = [];

    // Flatten the exams from the student's courses and attach course name
    student.courses.forEach(course => {
      if (course.exams && course.exams.length > 0) {
        course.exams.forEach(exam => {
          if (exam.date && new Date(exam.date) > now) {
            // Only include exams that do not already have an accommodation request.
            if (!exam.accommodations || exam.accommodations.length === 0) {
              upcomingExams.push({
                ...exam,
                courseName: course.name,
              });
            }
          }
        });
      }
    });

    //console.log('✅ Upcoming exams retrieved:', upcomingExams);
    return res.status(200).json(upcomingExams);
  } catch (error) {
    console.error('🔥 ERROR during Prisma query:');
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}