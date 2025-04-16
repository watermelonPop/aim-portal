require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = async (req, res) => {
    if (req.method === 'GET') {
        const professorId = req.query.userId;
        try {
            const professor = await prisma.professor.findUnique({
                where : {
                    userId : Number(professorId),
                },
                include : {
                    account:true,
                },
            });

            //const 
        res.status(200).json(professor);
            // const advisors = await prisma.advisor.findMany({
            //     include:{
            //         account:true
            //     },
            // });
            //  //console.log("SUCCESS BEFORE RETURNING JSON:",advisors);
            // // const advisorIds = advisors.map(advisor => advisor.userId);
            // res.status(200).json({ advisors });

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
};
