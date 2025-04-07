import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  const userId = parseInt(req.query.userId, 10);
  if (isNaN(userId)) {
    return res.status(400).json({ error: "Invalid userId" });
  }

  try {
    const forms = await prisma.form.findMany({
      where: { userId },
      orderBy: { submittedDate: "desc" },
    });
    res.status(200).json({ forms });
  } catch (error) {
    console.error("Error fetching student forms:", error);
    res.status(500).json({ error: "Server error" });
  }
}
