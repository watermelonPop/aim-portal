import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Fetch all students with complete details
      const students = await prisma.student.findMany({
        include: {
          account: {  // Fetch related account details
            select: {
              name: true,
              email: true,
            },
          },
          accommodations: {  // Fetch student accommodations
            select: {
              id: true,
              type: true,
              status: true,
              date_requested: true,
              advisorId: true,
              notes: true,
            },
          },
          assistive_technologies: {  // Fetch assistive technology details
            select: {
              id: true,
              type: true,
              available: true,
              advisorId: true,
            },
          },
        },
        orderBy: {
          account: {
            name: 'asc',
          },
        },
      });

      // Format response properly
      const formattedStudents = students.map(student => ({
        userId: student.userId,
        UIN: student.UIN,
        student_name: student.account?.name || "N/A",
        email: student.account?.email || "N/A",
        phone_number: student.phone_number,
        dob: student.dob,
        accommodations: student.accommodations.map(accommodation => ({
          id: accommodation.id,
          type: accommodation.type,
          status: accommodation.status,
          date_requested: accommodation.date_requested,
          advisorId: accommodation.advisorId,
          notes: accommodation.notes,
        })),
        assistive_technologies: student.assistive_technologies.map(tech => ({
          id: tech.id,
          type: tech.type,
          available: tech.available,
          advisorId: tech.advisorId,
        })),
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
