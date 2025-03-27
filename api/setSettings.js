require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const { user_id, settings } = req.body;

    if (!user_id || !settings) {
      return res.status(400).json({ error: 'User ID & settings are required' });
    }

    try {
      // Update user settings using Prisma
      const updatedSettings = await prisma.settings.updateMany({
        where: { userId: parseInt(user_id, 10) },
        data: {
          content_size: settings.content_size,
          highlight_tiles: settings.highlight_tiles,
          highlight_links: settings.highlight_links,
          text_magnifier: settings.text_magnifier,
          align_text: settings.align_text,
          font_size: settings.font_size,
          line_height: settings.line_height,
          letter_spacing: settings.letter_spacing,
          contrast: settings.contrast,
          saturation: settings.saturation,
          mute_sounds: settings.mute_sounds,
          hide_images: settings.hide_images,
          reading_mask: settings.reading_mask,
          highlight_hover: settings.highlight_hover,
          cursor_size: settings.cursor_size,
          cursor_color: settings.cursor_color,
          cursor_border_color: settings.cursor_border_color
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
