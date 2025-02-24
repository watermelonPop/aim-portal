
require('dotenv').config();
const { OAuth2Client } = require('google-auth-library');
const { neon } = require('@neondatabase/serverless');

const REDIRECT_URI = "http://localhost:3000/api/oauth2callback";
const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, CLIENT_ID, CLIENT_SECRET } = process.env;
const sql = neon(`postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=require`);

const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    try {
      const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email']
      });
      res.status(200).json({ authUrl: url });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
