require('dotenv').config();
const { OAuth2Client } = require('google-auth-library');
const { PrismaClient } = require('@prisma/client');

const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = process.env;
const prisma = new PrismaClient();

const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    try {
      const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: [
          'https://www.googleapis.com/auth/userinfo.profile',
          'https://www.googleapis.com/auth/userinfo.email'
        ],
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
