require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;
const sql = neon(`postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=require`);

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    try {
      // Fetch all rows from the "requests" table
      const results = await sql`
        SELECT
          user id,
          user_name,
          uin,
          advisor_id,
          user_email,
          phone_number,
          dob,
          notes
        FROM requests
      `;
      
      res.status(200).json({ requests: results });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
