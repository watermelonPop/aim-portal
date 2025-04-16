require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const { userId, dob, uin, phoneNumber } = req.body;
    //console.log(userId);

    if (!userId || !phoneNumber || !dob || !uin) {
            return res.status(400).json({ error: 'User ID, phone number, dob, and uin are required' });
    }

    try {
        const user = await prisma.user.create({
                data: {
                  userId: Number(userId),
                  dob: dob,
                  UIN: uin,
                  phone_number: phoneNumber,
                },
        });

      if (user) {
        res.status(200).json({ success: true, user: user });
      } else {
        res.status(200).json({ success: false });
      }
    } catch (error) {
      console.error('Error creating User:', error.message);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};