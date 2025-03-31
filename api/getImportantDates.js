// pages/api/getImportantDates.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {
    // Fetch only upcoming dates (>= today) and sort by date ascending (earliest first)
    const importantDates = await prisma.important_Dates.findMany({
      where: {
        date: {
          gte: new Date()
        }
      },
      orderBy: { date: 'asc' }
    });
    return res.status(200).json(importantDates);
  } catch (error) {
    console.error('Error fetching important dates: ', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await prisma.$disconnect();
  }
}
