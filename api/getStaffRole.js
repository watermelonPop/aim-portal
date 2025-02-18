require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;
const sql = neon(`postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=require`);

module.exports = async (req, res) => {
  if (req.method === 'GET') {
        const usId = req.query.user_id;
        if (!usId) {
                return res.status(400).json({ error: 'user_id is required' });
        }
        try {
        const result = await sql`SELECT * FROM advisors WHERE user_id = ${usId}`;
        res.status(200).json({ res: result });
        } catch (error) {
        res.status(500).json({ error: error.message });
        }
        } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
        }
};