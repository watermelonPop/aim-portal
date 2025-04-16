const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function updatePermissions() {
  // Set these to the correct values you want to use.
  const newFontSize = 14;       // Replace with your desired font_size
  const newLineHeight = 5000;   // Replace with your desired line_height
  const newLetterSpacing = 0;   // Replace with your desired letter_spacing

  // Update all records in the Settings table with the new values
  const resultAdmin = await prisma.advisor.updateMany({
    where:{
        role: "Admin"
    },
    data:{
        global_settings: true,
        accomodation_modules: true,
        note_taking_modules: true,
        assistive_technology_modules:true,
        accessible_testing_modules: true, 
        student_case_information: true, 
    },
  });

  const resultCoord = await prisma.advisor.updateMany({
    where:{
        role: "Coordinator"
    },
    data:{
        global_settings: false,
        accomodation_modules: true,
        note_taking_modules: true,
        assistive_technology_modules:true,
        accessible_testing_modules: true, 
        student_case_information: true, 
    },
  });

  const resultTesting = await prisma.advisor.updateMany({
    where:{
        role: "Testing_Staff"
    },
    data:{
        global_settings: false,
        accomodation_modules: false,
        note_taking_modules: false,
        assistive_technology_modules: false,
        accessible_testing_modules: true, 
        student_case_information: true, 
    },
  });

  const resultTech = await prisma.advisor.updateMany({
    where:{
        role: "Tech_Staff"
    },
    data:{
        global_settings: false,
        accomodation_modules: false,
        note_taking_modules: false,
        assistive_technology_modules:true,
        accessible_testing_modules: false, 
        student_case_information: true, 
    },
  });







  //console.log(`DONE`);
}

updatePermissions()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });