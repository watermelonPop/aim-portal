import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { userId } = req.body;

      // Validate required fields
      if (!userId) {
        return res.status(400).json({ error: 'Missing required user id' });
      }

      // Delete the request using Prisma
      const deletedRequest = await prisma.request.deleteMany({
        where: {
          non_registered_userId: userId, 
        },
      });
      

      // Check if any rows were deleted
      if (deletedRequest.count === 0) {
        return res.status(404).json({ error: 'No requests found for this email' });
      }

      res.status(200).json({ message: 'Request deleted successfully' });
    } catch (error) {
      console.error('Error in POST request:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
