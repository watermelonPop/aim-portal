require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;
const sql = neon(`postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=require`);


module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { student_id, name, uin, dob, email, phone_number } = req.body;

    if (!student_id || !name || !uin || !dob || !email || !phone_number) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Update the student record in the database
    await sql`
      UPDATE students
      SET name = ${name}, uin = ${uin}, dob = ${dob}, email = ${email}, phone_number = ${phone_number}
      WHERE student_id = ${student_id}
    `;

    res.status(200).json({ message: 'Student information updated successfully' });
  } catch (error) {
    console.error('Database update error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
