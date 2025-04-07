const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userId = parseInt(req.headers['x-user-id']);


    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const advisor = await prisma.advisor.findUnique({
      where: { userId: parseInt(userId) },
      select: {
        global_settings: true,
        assistive_technology_modules: true,
        accomodation_modules: true,
        note_taking_modules: true,
        student_case_information: true,
        accessible_testing_modules: true
      } 
    });

    if (!advisor) {
      return res.status(404).json({ error: 'Advisor not found' });
    }

    return res.status(200).json({ permissions: advisor });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
