require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;
const sql = neon(`postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=require`);

module.exports = async (req, res) => {
  if (req.method === 'POST') {
        try {
                // Check if req.body exists and has the required properties
                if (!req.body || !req.body.email) {
                  return res.status(400).json({ error: 'Missing required email' });
                }
          
                const { email } = req.body;
          
                // Insert the new request
                await sql`
                  DELETE FROM requests WHERE user_email = ${email}
                `;
          
                res.status(200).json({ message: 'Request deleted successfully' });
              } catch (error) {
                console.error('Error in POST request:', error);
                res.status(500).json({ error: error.message });
              }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
