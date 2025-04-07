import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const userId = parseInt(req.query.userId, 10);

  if (!userId || isNaN(userId)) {
    return res.status(400).json({ error: 'Missing or invalid userId in query' });
  }

  try {
    const forms = await prisma.form.findMany({
      where: { userId },
      select: {
        id: true,
        type: true,
        status: true,
        submittedDate: true,
        dueDate: true,
        formUrl: true,
      },
      orderBy: { submittedDate: 'desc' },
    });

    res.status(200).json({ forms });
  } catch (err) {
    console.error('❌ Error fetching forms:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
