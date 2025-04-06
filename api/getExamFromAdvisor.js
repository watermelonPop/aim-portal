require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = async (req, res) => {
    if (req.method === 'GET') {
        const userId = req.query.userId;
        //console.log("USERID FROM FETCHEXAMBYADVISOR:",userId);
        //const searchQuery = req.query.searchQuery;
        //console.log("seqrchQuery:",searchQuery);
        // const _skip =  parseInt(req.query.skip) || 0;
        // const _take = parseInt(req.query.take) || 9;
        // if (!searchQuery) {
        //     return res.status(400).json({ error: "Missing 'query' parameter" });
        // }
        // console.log("before the advisor call");
        //https://www.prisma.io/docs/orm/prisma-client/queries/pagination
        try {
            const exams = await prisma.exam.findMany({
                where : {
                    advisorId : Number(userId),
                },
                include : {
                    course:true,
                },
            });

            //const 
        res.status(200).json({exams});
            // const advisors = await prisma.advisor.findMany({
            //     include:{
            //         account:true
            //     },
            // });
            //  console.log("SUCCESS BEFORE RETURNING JSON:",advisors);
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
