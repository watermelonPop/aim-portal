require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = async (req, res) => {
  if (req.method === 'POST') {
      // Check if req.body exists and has the email property
      const email = req.body?.email;

      if (!email) {
          return res.status(400).json({ error: 'Email is required' });
      }
      console.log("BEFORE CHECK ACCOUNT");
      try {
          // Fetch account using Prisma
          const account = await prisma.account.findUnique({
              where: { email },
          });

          console.log(account);

          if (account) {
              res.status(200).json({ exists: true, user_info: account });
          } else {
              res.status(200).json({ exists: false });
          }
      } catch (error) {
          res.status(500).json({ error: error.message });
      }
  } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};