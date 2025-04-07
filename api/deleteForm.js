import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
        console.log("STARTING DELETE FORM");
  if (req.method === 'POST') {
    try {
      const { userId, type } = req.body;

      // Validate required fields
      if (!userId || !type) {
        return res.status(400).json({ error: 'Missing required user id and form type to delete' });
      }

      const deletedForm = await prisma.form.deleteMany({
        where: {
          userId: userId,
          type: type 
        },
      });

      console.log("deleted form: ", deletedForm);
      

      // Check if any rows were deleted
      if (deletedForm.count === 0) {
        return res.status(404).json({ error: `No forms of type: ${type} were found for this user` });
      }

      res.status(200).json({ message: 'Form deleted successfully' });
    } catch (error) {
      console.error('Error in POST request:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}