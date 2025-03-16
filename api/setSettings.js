require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;
const sql = neon(`postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=require`);

module.exports = async (req, res) => {
        if (req.method === 'POST') {
          // Check if req.body exists and has the email property
          const { user_id, settings } = req.body;
          
          if (!user_id || !settings) {
            return res.status(400).json({ error: 'user id & settings is required' });
          }
      
          try {
            const result = await sql`
                UPDATE settings 
                SET 
                        content_size = ${settings.content_size},
                        highlight_tiles = ${settings.highlight_tiles},
                        highlight_links = ${settings.highlight_links},
                        text_magnifier = ${settings.text_magnifier},
                        align_text = ${settings.align_text},
                        font_size = ${settings.font_size},
                        line_height = ${settings.line_height},
                        letter_spacing = ${settings.letter_spacing},
                        contrast = ${settings.contrast},
                        saturation = ${settings.saturation},
                        mute_sounds = ${settings.mute_sounds},
                        hide_images = ${settings.hide_images},
                        reading_mask = ${settings.reading_mask},
                        highlight_hover = ${settings.highlight_hover},
                        cursor = ${settings.cursor}
                WHERE user_id = ${user_id}
                RETURNING *
            `;
            if (result.length > 0) { 
              res.status(200).json({ success: true, updated_settings: result});
            }else{
              res.status(404).json({ success: false, message: 'No user settings found to update'});
            }
          } catch (error) {
            res.status(500).json({ error: error.message });
          }
        } else {
          res.setHeader('Allow', ['POST']);
          res.status(405).end(`Method ${req.method} Not Allowed`);
        }
};
      