import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { requestId, status } = req.body;

  if (!requestId || !status) {
    return res.status(400).json({ error: 'Missing requestId or status' });
  }

  try {
    // First, update the request status.
    const updatedRequest = await prisma.request.update({
      where: { id: requestId },
      data: { status },
    });

    // If the request is approved, convert the user to a student account.
    if (status === 'APPROVED') {
      const userId = updatedRequest.non_registered_userId;

      // Retrieve the user's data from the User model.
      const userRecord = await prisma.user.findUnique({
        where: { userId },
      });
      if (!userRecord) {
        throw new Error(`User with id ${userId} not found for conversion`);
      }

      // Update the associated Account role to STUDENT.
      await prisma.account.update({
        where: { id: userId },
        data: { role: 'STUDENT' },
      });

      // Create a new Student record with data from the user record.
      await prisma.student.create({
        data: {
          userId: userId,
          UIN: userRecord.UIN,
          dob: userRecord.dob,
          phone_number: userRecord.phone_number,
          advisors: {
            connect: { userId: updatedRequest.advisorId }
          },
        },
      });

      // Add the new student to 6 random courses from the Course table.
      const allCourses = await prisma.course.findMany();
      if (allCourses.length > 0) {
        // Shuffle the courses array and select up to 6 courses.
        const shuffled = allCourses.sort(() => 0.5 - Math.random());
        const selectedCourses = shuffled.slice(0, Math.min(6, shuffled.length));

        // Connect these courses to the student.
        await prisma.student.update({
          where: { userId },
          data: {
            courses: {
              connect: selectedCourses.map(course => ({ id: course.id })),
            },
          },
        });
      }

      // IMPORTANT:
      // Do NOT delete the user record because the Request record still references it.
      // Deleting the user would violate the foreign key constraint on the Request table.
      // If you really need to delete the User record, you'll have to first update or remove the related Request entries.
    }

    res.status(200).json({ message: 'Request status updated' });
  } catch (err) {
    console.error("❌ Error updating request status:", err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
