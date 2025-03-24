import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Fetch all students with the new schema structure
      const students = await prisma.student.findMany({
        select: {
          userId: true,
          UIN: true,
          phone_number: true,
          dob: true,
          account: { // Fetch the related account details
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          account: {
            name: 'asc',
          },
        },
      });

      // Format response to match expected output
      const formattedStudents = students.map(student => ({
        userId: student.userId,
        UIN: student.UIN,
        student_name: student.account?.name || "N/A",
        email: student.account?.email || "N/A",
        phone_number: student.phone_number,
        dob: student.dob,
      }));

      res.status(200).json({ students: formattedStudents });
    } catch (error) {
      console.error('Error fetching students:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
