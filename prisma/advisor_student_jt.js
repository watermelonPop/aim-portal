const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');
const prisma = new PrismaClient();

async function getStudentUserIds() {
    try {
      const studentUserIds = await prisma.student.findMany({
        select: { userId: true },
      });
      // If you want just an array of userIds rather than objects:
      const userIds = studentUserIds.map(student => student.userId);
      console.log(userIds);
      return userIds;
    } catch (error) {
      console.error('Error fetching student userIds:', error);
    }
  }

  async function getAdvisorUserIds() {
    try {
        const advisorUserIds = await prisma.advisor.findMany({
            select: { userId: true }, // Get only userId values
          });
      // If you want just an array of userIds rather than objects:
      const userIds = advisorUserIds.map(advisor => advisor.userId);
      console.log(userIds);
      return userIds;
    } catch (error) {
      console.error('Error fetching advisor userIds:', error);
    }
  }

  async function getCoordinatorUserIds() {
    try {
        const coordinatorAdvisors = await prisma.advisor.findMany({
            where: { role: "Coordinator" }, // Only fetch advisors with this role
            select: { userId: true }, // Get only userId values
          });
      // If you want just an array of userIds rather than objects:
      const userIds = coordinatorAdvisors.map(advisor => advisor.userId);
      console.log(userIds);
      return userIds;
    } catch (error) {
      console.error('Error fetching advisor userIds:', error);
    }
  }
  
 

async function main() {
    const student_ids = await getStudentUserIds();  
    const advisor_ids = await getAdvisorUserIds();
    const coordinator_ids = await getCoordinatorUserIds();
    // console.log(student_ids);
    // console.log(advisor_ids);
    
    //UNLINKING
    // for(let i = 0; i< advisor_ids.length; i++){
    //     const advisor_id = advisor_ids[i];

    //     console.log("start dropping: ", i);
    //     await prisma.advisor.update({
    //         where: { userId: advisor_id }, // The specific advisor
    //         data: {
    //           students: {
    //             set: [], // Removes all linked students
    //           },
    //         },
    //       });
    //     console.log("done dropping: ", i);
          
    // }


    for(let i = 0; i< student_ids.length; i++){
        const student_id = student_ids[i];
        
        const advisor_id = coordinator_ids[Math.floor(Math.random()*coordinator_ids.length)]
    
        //find 5 random students
        console.log("start: ", i);
        await prisma.student.update({
            where: { userId: student_id },
            data: {
              advisors: {
                connect: {userId: advisor_id},
              },
            },
          });
          console.log("done: ", i)
    }   
    


}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });