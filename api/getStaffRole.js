require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    const userId = req.query.user_id;
    //console.log("USER ID: ", userId);

    if (!userId) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    try {
      // Fetch advisor data using Prisma
      const advisor = await prisma.advisor.findUnique({
        where: { userId: parseInt(userId, 10) },
      });
      //console.log("ADVISOR HERE: ", advisor);
      res.status(200).json({ res: advisor });
    } catch (error) {
      console.error('Error fetching advisors:', error.message);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
