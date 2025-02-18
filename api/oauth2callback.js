require('dotenv').config();
const { OAuth2Client } = require('google-auth-library');
const { neon } = require('@neondatabase/serverless');

const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = process.env;
const sql = neon(`postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=require`);

const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    const { code } = req.query;
    try {
      // Exchange authorization code for tokens
      const r = await oauth2Client.getToken(code);
      const tokens = r.tokens;

      // Use the ID Token for verification
      const idToken = tokens.id_token;

      if (!idToken) {
        throw new Error('No ID Token returned from Google');
      }

      // Optionally verify the ID Token here (optional)
      const ticket = await oauth2Client.verifyIdToken({
        idToken: idToken,
        audience: CLIENT_ID,
      });

      const payload = ticket.getPayload();
      console.info('User info:', payload);

      // Redirect back to your app with the ID Token
      res.redirect(`/?token=${idToken}`);
    } catch (error) {
      console.error('Error in OAuth callback:', error);
      res.status(500).send('Authentication failed');
    }
  } else {
    res.status(405).send('Method not allowed');
  }
};