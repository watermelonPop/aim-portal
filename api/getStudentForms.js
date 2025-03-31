// /pages/api/getStudentForms.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const userId = parseInt(req.query.userId, 10);
  if (isNaN(userId)) {
    return res.status(400).json({ error: "Invalid userId (must be a number)" });
  }
  

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId in query' });
  }

  try {
    const forms = await prisma.form.findMany({
      where: { userId: userId },
      orderBy: { submittedDate: 'desc' },
    });

    res.status(200).json({ forms });
  } catch (error) {
    console.error('Error fetching student forms:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
