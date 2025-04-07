import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { studentId, assistiveTechType } = req.body;

  if (!studentId || !assistiveTechType) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Get advisors with role 'Coordinator'
    const advisors = await prisma.advisor.findMany({
      where: { role: 'Coordinator' }
    });
    if (advisors.length === 0) {
      return res.status(500).json({ error: 'No advisors available' });
    }
    const randomAdvisor = advisors[Math.floor(Math.random() * advisors.length)];

    const assistiveTechRequest = await prisma.assistive_Technology.create({
      data: {
        available: true, // default to true
        studentId: parseInt(studentId, 10),
        type: assistiveTechType,
        advisorId: randomAdvisor.userId
      }
    });

    return res.status(200).json(assistiveTechRequest);
  } catch (error) {
    console.error("Error applying for assistive technology:", error);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
}
