require('dotenv').config();
const { OAuth2Client } = require('google-auth-library');
const { PrismaClient } = require('@prisma/client');

const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = process.env;
const prisma = new PrismaClient();
const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    const { code } = req.query;
    try {
      // Exchange authorization code for tokens
      const r = await oauth2Client.getToken(code);
      const tokens = r.tokens;

      if (!tokens.id_token) {
        throw new Error('No ID Token returned from Google');
      }

      // Verify the ID Token
      const ticket = await oauth2Client.verifyIdToken({
        idToken: tokens.id_token,
        audience: CLIENT_ID,
      });

      const payload = ticket.getPayload();
      console.info('User info:', payload);

      // Redirect back to your app with the ID Token
      res.redirect(`/?token=${tokens.id_token}`);
    } catch (error) {
      console.error('Error in OAuth callback:', error);
      res.status(500).send('Authentication failed');
    }
  } else {
    res.status(405).send('Method not allowed');
  }
};
