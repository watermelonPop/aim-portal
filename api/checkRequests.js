require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;
const sql = neon(`postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=require`);

module.exports = async (req, res) => {
  if (req.method === 'GET') {
        const email = req.query.email;

        try {
                const result = await sql`
                        SELECT * FROM requests WHERE user_email = ${email}
                `;
                if (result && result.length > 0) { 
                        res.status(200).json({ exists: true, request: result[0]});
                } else {
                        res.status(200).json({ exists: false, message: "No request found" });
                }
        } catch (error) {
                res.status(500).json({ error: error.message });
        }

        } else {
                res.setHeader('Allow', ['GET']);
                res.status(405).end(`Method ${req.method} Not Allowed`);
        }
};
