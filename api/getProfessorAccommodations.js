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
            accommodations: true
          }
        }
      }
    });


    res.status(200).json(professor);
  } catch (error) {
    console.error('Error fetching student data:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
