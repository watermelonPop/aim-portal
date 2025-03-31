require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const { advisorId, permissions } = req.body;

    if (!advisorId || typeof permissions === 'undefined') {
      return res.status(400).json({ error: "Missing required parameters: advisorId or permissions" });
    }

    if (permissions.length != 6) {
      return res.status(400).json({ error: "bad permissions" });
    }

    const glo_set = permissions[0];
    const acc_tes = permissions[1];
    const acc_mod = permissions[2];
    const ass_tec = permissions[3];
    const not_tak = permissions[4];
    const stu_cas = permissions[5];

    try {
      const advisors = await prisma.advisor.update({
        where : {userId : advisorId},
        data:{
          global_settings: glo_set,
          accomodation_modules: acc_mod,
          note_taking_modules: not_tak,
          assistive_technology_modules:ass_tec,
          accessible_testing_modules: acc_tes,
          student_case_information: stu_cas,
        },
    });

      res.status(200).json({
        message: "Advisor updated successfully",
      });
    } catch (error) {
      console.error("Update error:", error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
