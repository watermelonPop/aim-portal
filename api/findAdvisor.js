require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;
const sql = neon(`postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=require`);

module.exports = async (req, res) => {
    if(req.method === 'GET'){
        const searchQuery = req.query.query;
        if(!searchQuery){
            return res.status(400).json({ error: "Missing 'query' parameter" });
        }
        //TRY HERE
        try{
            const advisors = await sql`
                SELECT user_id, name, email, role
                FROM advisors
                WHERE 
                name ILIKE ${'%' + searchQuery + '%'} OR 
                role ILIKE ${'%' + searchQuery + '%'} OR 
                array_to_string(responsibilities, ' ') ILIKE ${'%' + searchQuery + '%'}
            `;
            res.status(200).json({ advisors });
        } catch (error) {
        res.status(500).json({ error: error.message });
        }
    }
    else {
        res.setHeader('Allow',['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
};