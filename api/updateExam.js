require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = async (req, res) => {
  if (req.method === 'POST') {
      const {examid, completedUrl} = req.body;


      if (!examid) {
          return res.status(400).json({ error: 'exam id is required' });
      }

      if (!completedUrl) {
        return res.status(400).json({ error: 'exam URL is required' });
    }

      try {
          // Fetch user account using Prisma
          const exam = await prisma.exam.update({
              where: { id: Number(examid), },
              data: { completedExamURL: completedUrl, },
              include : {
                course:true,
            },
          });

          res.status(200).json(exam);
          
      } catch (error) {
          res.status(500).json({ error: error.message });
      }
  } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};