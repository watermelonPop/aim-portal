require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;
const sql = neon(`postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=require`);
module.exports = async (req, res) => {
  if (req.method === 'GET') {
    const userId = req.query.user_id;
    
    if (!userId) {
      return res.status(400).json({ error: 'User Id is required' });
    }

    try {
      const result = await sql`
        SELECT * FROM settings WHERE user_id = ${userId}
      `;
      if (result && result.length > 0) { 
        res.status(200).json({ exists: true, settings_info: result[0] });
      } else {
        res.status(200).json({ exists: false });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
