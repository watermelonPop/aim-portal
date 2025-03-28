import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { userId, student_name, UIN, dob, email, phone_number } = req.body;

    // Validate required fields
    if (!userId || !student_name || !UIN || !dob || !email || !phone_number) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Update the Account table (name, email)
    const updatedAccount = await prisma.account.update({
      where: { id: userId },
      data: {
        name: student_name,
        email: email,
      },
    });

    // Update the Student table (UIN, DOB, phone number)
    const updatedStudent = await prisma.student.update({
      where: { userId: userId },
      data: {
        UIN: parseInt(UIN, 10),
        dob: dob,
        phone_number: phone_number,
      },
    });

    res.status(200).json({
      message: 'Student information updated successfully',
      updatedAccount,
      updatedStudent,
    });
  } catch (error) {
    console.error('Database update error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
