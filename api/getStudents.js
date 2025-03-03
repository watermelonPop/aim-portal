require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;
const sql = neon(`postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=require`);

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    try {
      // Fetch all students from the 'students' table
      const students = await sql`
        SELECT student_id, name, uin, email, phone_number, dob, date_registered
        FROM students
        ORDER BY name ASC
      `;

      res.status(200).json({ students });
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
