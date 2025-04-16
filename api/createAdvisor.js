require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const { userId, role } = req.body;
    //console.log(userId);

    if (!userId || !role) {
            return res.status(400).json({ error: 'User ID, and role are required' });
    }

    try {
        let acc = await prisma.account.findUnique({
                where: {
                    id: Number(userId),
                },
            });
            
            if (acc) {
                acc = await prisma.account.update({
                    where: {
                        id: Number(userId),
                    },
                    data: {
                        role: 'ADVISOR',
                    },
                });
        } else {
                throw new Error('Account not found');
        }

        const advisor = await prisma.advisor.create({
                data: {
                  userId: Number(userId),
                  role: role,
                },
        });


        if (advisor) {
                res.status(200).json({ success: true, advisor: advisor});
        } else {
                res.status(200).json({ success: false });
        }
    } catch (error) {
      console.error('Error creating Advisor:', error.message);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};