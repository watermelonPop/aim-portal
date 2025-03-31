import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { requestId, status } = req.body;

  if (!requestId || !status) {
    return res.status(400).json({ error: 'Missing requestId or status' });
  }

  try {
    const updated = await prisma.request.update({
      where: { id: requestId },
      data: { status },
    });

    res.status(200).json({ message: 'Request status updated', updated });
  } catch (err) {
    console.error("❌ Error updating request status:", err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
