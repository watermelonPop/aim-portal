require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = async (req, res) => {
  console.log("CREATE ACCOUNT START");
  if (req.method === 'POST') {
    const {email, name, role} = req.body;

    if (!email || !name || !role) {
      return res.status(400).json({ error: 'email, name, and role are required' });
    }

    try {
      const account = await prisma.account.create({
              data: {
                email: email,
                name: name,
                role: role,
              },
      });

      console.log("ACCOUNT HERE: ", account);

      const settings = await prisma.settings.create({
        data: {
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
          cursor: "Regular",
          account: {
            connect: {id: Number(account.id)}
          }
        }
      });

      console.log(account);

      if (account && settings) {
        res.status(200).json({ success: true, account: account });
      } else {
        res.status(200).json({ success: false });
      }
    } catch (error) {
      console.error('Error creating account:', error.message);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};