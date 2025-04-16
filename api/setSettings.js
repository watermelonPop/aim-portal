require('dotenv').config();
const { PrismaClient} = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const { user_id, settings } = req.body;

    if (!user_id || !settings) {
      return res.status(400).json({ error: 'User ID & settings are required' });
    }

    //console.log(settings);

    try {
      // Update user settings using Prisma
      const updatedSettings = await prisma.settings.updateMany({
        where: { userId: parseInt(user_id, 10) },
        data: {
          ...settings
        },
      });

      res.status(200).json({ success: true, updated_settings: updatedSettings });
    } catch (error) {
      console.error('Error updating settings:', error.message);
      
      if (error.code === 'P2025') {
        return res.status(404).json({ success: false, message: 'No user settings found to update' });
      }

      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
