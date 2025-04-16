require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = async (req, res) => {
  if (req.method === 'GET') {
      // Check if req.body exists and has the email property
      const id = req.query.userId;

      if (!id) {
          return res.status(400).json({ error: 'user id is required' });
      }
      try {
          // Fetch user account using Prisma
          const user = await prisma.user.findUnique({
              where: { userId: Number(id) },
          });

          //console.log(user);

          if (user) {
              res.status(200).json({ exists: true, user_info: user });
          } else {
              res.status(200).json({ exists: false });
          }
      } catch (error) {
          res.status(500).json({ error: error.message });
      }
  } else {
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};