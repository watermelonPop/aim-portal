import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { accommodationId, status } = req.body;

    if (!accommodationId || !status) {
      return res.status(400).json({ error: 'Missing accommodationId or status' });
    }

    const updated = await prisma.accommodations.update({
      where: { id: Number(accommodationId) },
      data: { status },
    });

    res.status(200).json({
      message: 'Accommodation status updated successfully',
      updated,
    });
  } catch (error) {
    console.error('❌ Accommodation update error:', error);
    res.status(500).json({
      error: error.message || 'Internal Server Error',
    });
  }
}
