require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;
const sql = neon(`postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=require`);

module.exports = async (req, res) => {
  if (req.method === 'GET') {
  try {
    const result = await sql`
      SELECT advisor_id, COUNT(*) as student_count
      FROM students
      GROUP BY advisor_id
      ORDER BY student_count ASC
      LIMIT 1;
    `;
    if (result && result.length > 0) { 
      res.status(200).json({ least_used_advisor: result[0].advisor_id,
        student_count: result[0].student_count });
    } else {
      res.status(200).json({ message: "No advisor data found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
      
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
