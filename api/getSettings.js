require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    const userId = req.query.user_id;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    try {
      // Fetch user settings from Prisma
      const settings = await prisma.settings.findFirst({
        where: { userId: parseInt(userId, 10) },
      });

      if (settings) {
        res.status(200).json({ exists: true, settings_info: settings });
      } else {
        res.status(200).json({ exists: false });
      }
    } catch (error) {
      console.error('Error fetching settings:', error.message);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
