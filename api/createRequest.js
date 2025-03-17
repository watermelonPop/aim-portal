require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;
const sql = neon(`postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=require`);

module.exports = async (req, res) => {
  if (req.method === 'POST') {
        try {
                // Check if req.body exists and has the required properties
                if (!req.body || !req.body.user_name || !req.body.user_email || !req.body.dob || !req.body.uin || !req.body.phone_number || !req.body.notes) {
                  return res.status(400).json({ error: 'Missing required fields' });
                }
          
                const { user_name, user_email, dob, uin, phone_number, notes } = req.body;
          
                // Construct the full URL for the getNextAdvisor API
                const protocol = req.headers['x-forwarded-proto'] || 'http';
                const host = req.headers['x-forwarded-host'] || req.headers.host;
                const nextAdvisorUrl = `${protocol}://${host}/api/getNextAdvisor`;
          
                // Fetch the next advisor_id
                const advisorResponse = await fetch(nextAdvisorUrl);
                if (!advisorResponse.ok) {
                  throw new Error('Failed to fetch next advisor');
                }
                const advisorData = await advisorResponse.json();
                const advisor_id = advisorData.advisor_id;

                console.log("ADVID: " + advisor_id);
          
                // Insert the new request
                await sql`
                  INSERT INTO requests (user_name, user_email, advisor_id, dob, uin, phone_number, notes) 
                  VALUES (${user_name}, ${user_email}, ${advisor_id}, ${dob}, ${uin}, ${phone_number}, ${notes})
                `;
          
                res.status(200).json({ message: 'Request created successfully' });
              } catch (error) {
                console.error('Error in POST request:', error);
                res.status(500).json({ error: error.message });
              }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
