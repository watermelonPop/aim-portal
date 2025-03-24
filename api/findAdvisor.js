// findAdvisor.js

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;
const sql = neon(`postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=require`);

module.exports = async (req, res) => {
    if (req.method === 'GET') {
        const searchQuery = req.query.query;
        if (!searchQuery) {
            return res.status(400).json({ error: "Missing 'query' parameter" });
        }
        try {
            const advisors = await sql`
                SELECT 
                    user_id, 
                    name, 
                    email, 
                    role, 
                    global_settings, 
                    accommodation_modules, 
                    note_taking_modules, 
                    assistive_tech_modules, 
                    accessible_testing_modules, 
                    student_case_information
                FROM advisors
                WHERE 
                  name ILIKE ${'%' + searchQuery + '%'}
            `;
            res.status(200).json({ advisors });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
};
