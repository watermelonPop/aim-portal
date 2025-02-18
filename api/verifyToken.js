require('dotenv').config();
const { OAuth2Client } = require('google-auth-library');
const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = process.env;
const client = new OAuth2Client(CLIENT_ID);
module.exports = async (req, res) => {
        if (req.method === 'POST') {
          const { token } = req.body;
      
          try {
            if (!token) {
              throw new Error('No token provided');
            }
      
            // Verify the ID Token
            const ticket = await client.verifyIdToken({
              idToken: token,
              audience: CLIENT_ID,
            });
      
            const payload = ticket.getPayload();
            const userId = payload['sub'];
      
            // Respond with user info if valid
            res.status(200).json({ valid: true, userId: userId, email: payload.email });
          } catch (error) {
            console.error('Error verifying token:', error.message);
            res.status(401).json({ valid: false, error: 'Invalid or expired token' });
          }
        } else {
          res.status(405).send('Method not allowed');
        }
      };