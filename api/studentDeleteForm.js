import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  console.log("🗑️ STARTING DELETE FORM");

  if (req.method === 'POST') {
    try {
      const { formId } = req.body;

      if (!formId) {
        return res.status(400).json({ error: 'Missing formId' });
      }

      const deletedForm = await prisma.form.delete({
        where: { id: formId },
      });

      console.log("✅ Deleted form:", deletedForm);
      res.status(200).json({ message: 'Form deleted successfully', deletedForm });

    } catch (error) {
      console.error('❌ Error deleting form:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
