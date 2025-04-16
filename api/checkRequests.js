require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({ error: 'Userid is required' });
    }

    try {
      const user = await prisma.user.findUnique({
        where: {
          userId: Number(userId)
        },
        include: {
          request: {
            take: 1,
            orderBy: {
              id: 'desc'  // or 'asc' if you want the oldest request
            }
          }
        }
      });

      //console.log(user);
      
      if (user && user.request.length !== 0) {
        res.status(200).json({ exists: true, request: user.request[0] });
      } else {
        res.status(200).json({ exists: false, message: "No request found" });
      }
    } catch (error) {
      console.error('Error fetching request:', error.message);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
