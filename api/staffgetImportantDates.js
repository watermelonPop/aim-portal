// pages/api/getImportantDates.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const dates = await prisma.important_Dates.findMany({
      orderBy: { date: 'desc' }
    });

    res.status(200).json({ dates });
  } catch (error) {
    console.error("Failed to fetch important dates:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
