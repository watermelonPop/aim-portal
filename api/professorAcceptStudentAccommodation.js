require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const {id} = req.body;

    if (!id) {
      return res.status(400).json({ error: 'request id is required' });
    }

    try {
        const accommodation = await prisma.accommodations.update({
                where: {
                  id: id, // Replace `id` with the actual variable holding the ID
                },
                data: {
                  status: "APPROVED", // Set the desired status
                },
        });
        console.log(accommodation);
        

      if (accommodation) {
        res.status(200).json({ success: true, new_request: accommodation });
      } else {
        res.status(200).json({ success: false });
      }
    } catch (error) {
      console.error('Error accepting student accommodation:', error.message);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};