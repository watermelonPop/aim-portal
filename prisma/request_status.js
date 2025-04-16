const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function assignBalancedRandomStatuses() {
  try {
    // Fetch all requests
    const requests = await prisma.request.findMany();

    // Define the possible statuses
    const statuses = ['PENDING', 'APPROVED', 'DENIED'];

    // Shuffle the requests array to randomize order
    const shuffledRequests = requests.sort(() => Math.random() - 0.5);

    // Loop over each request and assign a status in round-robin order
    for (let i = 0; i < shuffledRequests.length; i++) {
      const requestId = shuffledRequests[i].id;
      const newStatus = statuses[i % statuses.length];
      
      await prisma.request.update({
        where: { id: requestId },
        data: { status: newStatus },
      });
      
      //console.log(`Updated request ${requestId} with status ${newStatus}`);
    }
  } catch (error) {
    console.error('Error updating request statuses:', error);
  } finally {
    await prisma.$disconnect();
  }
}

assignBalancedRandomStatuses();