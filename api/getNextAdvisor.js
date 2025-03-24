import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const result = await prisma.advisor.findFirst({
        orderBy: {
          students: {
            _count: 'asc',
          },
        },
        include: {
          _count: {
            select: { students: true }
          }
        }
      });

      console.log(result);

      if (result) {
        res.status(200).json({
          least_used_advisor: result.userId,
          student_count: result._count.students
        });
      } else {
        res.status(200).json({ message: "No advisor data found" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
