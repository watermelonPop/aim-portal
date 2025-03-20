require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = async (req, res) => {
  if (req.method === 'GET') {
      // Check if req.body exists and has the email property
      const userId = req.query.userId;

      if (!userId) {
          return res.status(400).json({ error: 'userId is required' });
      }
      console.log("BEFORE CHECK ACCOUNT IS CONNECTED");
      try {
        const [user, student, advisor, professor] = await Promise.all([
                prisma.user.findFirst({
                  where: { userId: Number(userId) }
                }),
                prisma.student.findFirst({
                  where: { userId: Number(userId) }
                }),
                prisma.advisor.findFirst({
                  where: { userId: Number(userId) }
                }),
                prisma.professor.findFirst({
                  where: { userId: Number(userId) }
                })
        ]);
            
        const foundUser = user || student || advisor || professor;
        if (foundUser) {
                res.status(200).json({ exists: true});
        } else {
                // User not found in any table
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