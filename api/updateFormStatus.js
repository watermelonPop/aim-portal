require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const { formId, status } = req.body;

    if (!formId || !status) {
      return res.status(400).json({ error: "Missing required parameters: formId or status" });
    }

    if (!["SUBMITTED", "PENDING", "REJECTED", "OVERDUE", "APPROVED"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    try {
      await prisma.form.update({
        where: { id: Number(formId) },
        data: { status },
      });

      res.status(200).json({ message: "Form status updated successfully" });
    } catch (error) {
      console.error("Form status update error:", error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
