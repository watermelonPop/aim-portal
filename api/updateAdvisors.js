// updateAdvisors.js

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;
const sql = neon(`postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=require`);

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const { advisor_id, field, value } = req.body;

    if (!advisor_id || !field || typeof value === 'undefined') {
      return res.status(400).json({ error: "Missing required parameters: advisor_id, field, and value" });
    }

    // Validate the field name to prevent injection
    const validFields = [
      "global_settings",
      "accommodation_modules",
      "note_taking_modules",
      "assistive_tech_modules",
      "accessible_testing_modules",
      "student_case_information"
    ];
    if (!validFields.includes(field)) {
      return res.status(400).json({ error: "Invalid field provided" });
    }

    try {
      // Build a plain SQL string for the query, injecting the validated column name.
      // The values (value, advisor_id) are passed as parameters in the second argument.
      const queryString = `
        UPDATE advisors
        SET "${field}" = $1
        WHERE user_id = $2
        RETURNING *
      `;
      const result = await sql(queryString, [value, advisor_id]);

      if (result.length === 0) {
        // No row matched the given user_id
        return res.status(404).json({ error: `No row found for user_id = ${advisor_id}` });
      }

      // Return the updated row for debugging
      res.status(200).json({
        message: "Advisor updated successfully",
        updatedRow: result[0]
      });
    } catch (error) {
      console.error("Update error:", error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
