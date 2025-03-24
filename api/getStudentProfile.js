require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    const id = req.query.userId;

    if (!id) {
      return res.status(400).json({ error: 'userId is required' });
    }

    try {
      const student = await prisma.student.findUnique({
        where: { userId: Number(id) },
        include: {
          account: true,
        },
      });

      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      return res.status(200).json({
        uin: student.UIN,
        dob: student.dob,
        phone_number: student.phone_number,
        email: student.account.email,
      });
    } catch (error) {
      console.error("Error fetching student profile:", error);
      return res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
