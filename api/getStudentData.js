import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId parameter' });
  }

  try {
    const student = await prisma.student.findUnique({
      where: { userId: parseInt(userId, 10) },
      include: {
        accommodations: {
          include: {
            advisor: {
              include: { account: true }
            }
          }
        },
        assistive_technologies: {
          include: {
            advisor: {
              include: { account: true }
            }
          }
        },
        courses: true  // Added to include courses data
      }
    });

    res.status(200).json(student);
  } catch (error) {
    console.error('Error fetching student data:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
