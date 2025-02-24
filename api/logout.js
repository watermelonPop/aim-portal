
require('dotenv').config();
const { OAuth2Client } = require('google-auth-library');
const { neon } = require('@neondatabase/serverless');

const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = process.env;
const sql = neon(`postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=require`);

const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

module.exports = async (req, res) => {
        if (req.method === 'POST') {
            try {
                // Destroy the session if it exists
                if (req.session) {
                    req.session.destroy((err) => {
                        if (err) {
                            return res.status(500).json({ message: 'Logout failed', error: err });
                        }
                        res.clearCookie('connect.sid'); // Clear session cookie
                        res.status(200).json({ message: 'Logged out successfully' });
                    });
                } else {
                    res.status(200).json({ message: 'No active session' });
                }
            } catch (error) {
                res.status(500).json({ message: 'Server error', error: error.message });
            }
        } else {
            res.setHeader('Allow', ['POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
        }
};