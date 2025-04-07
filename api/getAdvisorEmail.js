// /pages/api/getAdvisorEmail.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  try {
    const studentWithAdvisor = await prisma.student.findUnique({
      where: { userId: parseInt(userId) },
      include: {
        advisors: {
          include: {
            account: {
              select: { email: true },
            },
          },
        },
      },
    });

    if (!studentWithAdvisor || studentWithAdvisor.advisors.length === 0) {
      return res.status(404).json({ error: 'Advisor not found.' });
    }

    const advisorEmail = studentWithAdvisor.advisors[0].account.email;

    return res.status(200).json({ advisorEmail });
  } catch (error) {
    console.error("Error fetching advisor email:", error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
