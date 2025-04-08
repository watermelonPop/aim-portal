import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { accId } = req.query;

  if (!accId) {
    return res.status(400).json({ error: 'Missing accId parameter' });
  }

  try {
    const deletedAccommodation = await prisma.accommodations.delete({
      where: { id: parseInt(accId, 10) }
    });
    return res.status(200).json(deletedAccommodation);
  } catch (error) {
    console.error("Error deleting accommodation:", error);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
}
