require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;
const sql = neon(`postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=require`);

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    // Check if req.body exists and has the email property
    const email = req.body && req.body.email;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    try {
      const result = await sql`
        SELECT * FROM accounts WHERE user_email = ${email}
      `;
      if (result.length > 0) { 
        res.status(200).json({ exists: true, user_info: result});
      }else{
        res.status(200).json({ exists: false});
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
