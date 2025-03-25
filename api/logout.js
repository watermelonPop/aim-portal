require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

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
      console.error('Logout error:', error.message);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
