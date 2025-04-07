import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    // Fetch requests with related advisor, user, and user's account details
    const requests = await prisma.request.findMany({
      include: {
        advisor: {
          select: {
            userId: true,
            role: true,
          },
        },
        user: {
          select: {
            userId: true,
            dob: true,
            UIN: true,
            phone_number: true,
            account: {  // Fetch associated account details (name)
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Format response
    const formattedRequests = requests.map(request => ({
      id: request.id,
      advisorId: request.advisorId,
      advisorRole: request.advisor?.role || "N/A",
      notes: request.notes,
      documentation: request.documentation,
      non_registered_userId: request.non_registered_userId,
      userId: request.user?.userId || null,
      student_name: request.user?.account?.name || "N/A", // Get student name from account
      dob: request.user?.dob || null,
      UIN: request.user?.UIN || null,
      phone_number: request.user?.phone_number || null,
    }));

    res.status(200).json({ requests: formattedRequests });
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
