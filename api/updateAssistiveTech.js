import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { id, type, available } = req.body;

  if (!id || typeof type !== "string" || typeof available !== "boolean") {
    return res.status(400).json({ message: "Invalid input. Type must be a string and available a boolean." });
  }

  try {
    const updated = await prisma.assistive_Technology.update({
      where: { id: Number(id) },
      data: {
        type,
        available
      },
    });

    res.status(200).json(updated);
  } catch (error) {
    console.error("❌ Prisma update failed:", error);
    res.status(500).json({ message: "Failed to update assistive technology" });
  }
}
