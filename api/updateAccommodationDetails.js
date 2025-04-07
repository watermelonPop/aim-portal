import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { id, type, status, date_requested, notes } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Accommodation ID is required.' });
    }

    if (!type || typeof type !== 'string') {
      return res.status(400).json({ error: 'Accommodation type is required and must be a string.' });
    }

    if (!status || typeof status !== 'string') {
      return res.status(400).json({ error: 'Accommodation status is required and must be a string.' });
    }

    const safeDate = new Date(date_requested);
    if (!date_requested || isNaN(safeDate.getTime())) {
      return res.status(400).json({ error: 'Invalid or missing date_requested.' });
    }

    const updated = await prisma.accommodations.update({
      where: { id },
      data: {
        type,
        status,
        date_requested: safeDate,
        notes: notes || "", // fallback to empty string
      },
    });

    res.status(200).json({ success: true, accommodation: updated });

  } catch (err) {
    console.error("❌ Failed to update accommodation:", err);
    res.status(500).json({ error: "Internal server error while updating accommodation." });
  }
}
