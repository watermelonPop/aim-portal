require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const { userId, dob, uin, phoneNumber } = req.body;
    console.log(userId);

    if (!userId || !phoneNumber || !dob || !uin) {
            return res.status(400).json({ error: 'User ID, phone number, dob, and uin are required' });
    }

    try {
        const user = await prisma.user.create({
                data: {
                  userId: Number(userId),
                  dob: dob,
                  UIN: uin,
                  phone_number: phoneNumber,
                },
        });

        const settings = await prisma.settings.create({
          data: {
            userId: Number(userId),
            content_size: 100,
            highlight_tiles: false,
            highlight_links: false,
            text_magnifier: false,
            align_text: "Middle",
            font_size: 14,
            line_height: 5000,
            letter_spacing: 0,
            contrast: "100%",
            saturation: "Regular",
            mute_sounds: false,
            hide_images: false,
            reading_mask: false,
            highlight_hover: false,
            cursor: "Regular"
          }
        });

      if (user && settings) {
        res.status(200).json({ success: true, user: user });
      } else {
        res.status(200).json({ success: false });
      }
    } catch (error) {
      console.error('Error creating User:', error.message);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};