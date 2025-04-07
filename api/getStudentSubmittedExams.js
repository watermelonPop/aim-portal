import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { userId } = req.query;

  console.log('🚀 API HIT: getStudentSubmittedExams');
  console.log('👉 userId received:', userId);

  if (!userId) {
    console.error('⛔ Missing userId parameter');
    return res.status(400).json({ error: 'Missing userId parameter' });
  }

  try {
    const parsedUserId = parseInt(userId);
    console.log('🔍 Parsed userId:', parsedUserId);

    // Retrieve the student with their courses and exams.
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

    let submittedExams = [];
    // Flatten out the exams and filter for those with a completedExamURL.
    student.courses.forEach(course => {
      if (course.exams && course.exams.length > 0) {
        course.exams.forEach(exam => {
          if (exam.completedExamURL && exam.completedExamURL !== "") {
            submittedExams.push({
              id: exam.id,
              completedExamURL: exam.completedExamURL,
              name: exam.name,
              date: exam.date,
              courseName: course.name,
            });
          }
        });
      }
    });

    console.log('✅ Submitted exams retrieved:', submittedExams);
    return res.status(200).json(submittedExams);
  } catch (error) {
    console.error('🔥 ERROR during Prisma query:');
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
