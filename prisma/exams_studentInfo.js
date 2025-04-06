const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addStudentNameAndEmail() {
  try {
    // Fetch all requests
    const exams = await prisma.exam.findMany();
    
    
    for (let i = 0; i < exams.length; i++) {
    //   const requestId = shuffledRequests[i].id;
    //   const newStatus = statuses[i % statuses.length];
    const examId = exams[i].id;
      const studId = exams[i].studentIds[0];
      const studentAccount = await prisma.account.findUnique({
            where: {id: studId},
        });

    const studEmail = studentAccount.email;
    const studName = studentAccount.name;


    const updated = await prisma.exam.update({
        where: {id: examId,},
        data: {
            studentEmail: studEmail,
            studentName: studName,
        },
    })

    console.log(`Updated exam ${examId} with student ${studEmail}, ${studName}`);
    }
  } catch (error) {
    console.error('Error updating request statuses:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addStudentNameAndEmail();