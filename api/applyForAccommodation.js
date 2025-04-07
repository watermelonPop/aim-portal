import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { studentId, accommodationType, classes, note, status } = req.body;
  
  // Validate required fields
  if (
    !studentId ||
    !accommodationType ||
    !classes ||
    !Array.isArray(classes) ||
    classes.length === 0 ||
    !note
  ) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  try {
    // Get advisors with role "Coordinator"
    const advisors = await prisma.advisor.findMany({
      where: { role: 'Coordinator' }
    });
    if (advisors.length === 0) {
      return res.status(500).json({ error: 'No advisors available' });
    }
    const randomAdvisor = advisors[Math.floor(Math.random() * advisors.length)];
    
    // Create an accommodation record for each class separately.
    const createdAccommodations = await Promise.all(
      classes.map(async (courseId) => {
        // Look up the course name from the DB
        const course = await prisma.course.findUnique({
          where: { id: parseInt(courseId, 10) },
          select: { name: true }
        });

        if (!course) {
          throw new Error(`Course with ID ${courseId} not found`);
        }

        return await prisma.accommodations.create({
          data: {
            type: accommodationType,
            status: status || 'pending',
            // Use the actual course name here
            notes: `${note} for class: ${course.name}`,
            student: {
              connect: { userId: parseInt(studentId, 10) }
            },
            courses: {
              connect: [{ id: parseInt(courseId, 10) }]
            },
            advisor: {
              connect: { userId: randomAdvisor.userId }
            }
          }
        });
      })
    );
    
    return res.status(200).json(createdAccommodations);
  } catch (error) {
    console.error("Error applying for accommodation:", error);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
}