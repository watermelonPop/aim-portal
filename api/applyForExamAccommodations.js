import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { examId, accommodationType, note, studentId } = req.body;
    if (!examId || !accommodationType || !note || !studentId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const parsedExamId = parseInt(examId);
    const parsedStudentId = parseInt(studentId);

    // Retrieve the exam to get its associated course ID.
    const exam = await prisma.exam.findUnique({
      where: { id: parsedExamId },
    });
    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    // Find advisors with role "Coordinator".
    const coordinators = await prisma.advisor.findMany({
      where: { role: 'Coordinator' },
    });
    if (coordinators.length === 0) {
      return res.status(500).json({ error: 'No coordinator advisor available' });
    }
    const randomCoordinator = coordinators[Math.floor(Math.random() * coordinators.length)];

    // Create a new accommodation record and connect it to the exam's course.
    const newAccommodation = await prisma.accommodations.create({
      data: {
        type: accommodationType,
        status: 'PENDING',
        // date_requested is set automatically per schema default.
        advisorId: randomCoordinator.userId,
        notes: note,
        studentId: parsedStudentId,
        courses: {
          connect: { id: exam.courseId },
        },
      },
    });

    //console.log('✅ Accommodation created:', newAccommodation);
    return res.status(200).json(newAccommodation);
  } catch (error) {
    console.error('🔥 Error creating accommodation:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
