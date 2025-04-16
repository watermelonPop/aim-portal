// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');
const prisma = new PrismaClient();

async function main() {
  //console.log('Starting Seeding\n');
  const num_students = 500;
  const num_users = num_students/5;
  const num_professors = num_students/10;
  const num_advisors = num_students/10;
  const existingUINs = new Set();


  const uniqueFirstNames = new Set();

  function getUniqueFirstName() {
    let firstName;
    do {
      firstName = faker.person.firstName();
    } while (uniqueFirstNames.has(firstName));
    uniqueFirstNames.add(firstName);
    return firstName;
  }

  const uniqueLastNames = new Set();

  function getUniqueLastName() {
    let lastName;
    do {
      lastName = faker.person.lastName();
    } while (uniqueLastNames.has(lastName));
    uniqueLastNames.add(lastName);
    return lastName;
  }

  function generateUniqueUIN() {
    let newUIN;
    do {
      let firstPart = '';
      for (let i = 0; i < 3; i++) {
        firstPart += faker.number.int({ min: 1, max: 9 }).toString();
      }
      const midPart = '00';
      let lastPart = '';
      for (let i = 0; i < 4; i++) {
        lastPart += faker.number.int({ min: 1, max: 9 }).toString();
      }
      newUIN = firstPart + midPart + lastPart;
    } while (existingUINs.has(newUIN));
    
    existingUINs.add(newUIN);
    return parseInt(newUIN, 10);
  }
  // --- Create Accounts ---
  //console.log('Creating Student Accounts\n');
  const studentAccounts = [];
  for (let i = 0; i < num_students; i++) {
    
    if(i === 0){
      const firstName = "Student";
      uniqueFirstNames.add(firstName);
      const lastName = "Doe";
      uniqueLastNames.add(lastName);
      const fullName = `${firstName} ${lastName}`;
      const email = `student1.aim@gmail.com`;
      const account = await prisma.account.create({
    
        data: {
          email,
          name: fullName,
          role: 'STUDENT',
        },
      });
      studentAccounts.push(account);

    }
    else{
      const firstName = getUniqueFirstName();
      const lastName = getUniqueLastName();
      const fullName = `${firstName} ${lastName}`;
      const email = `${firstName.toLowerCase()}_${lastName.toLowerCase()}@tamu.edu`;
      const account = await prisma.account.create({
    
        data: {
          email,
          name: fullName,
          role: 'STUDENT',
        },
      });
      studentAccounts.push(account);
    }
  }
  //console.log('DONE Creating Student Accounts\n');


  //console.log('START Creating User Accounts\n');
  const userAccounts = [];
  for (let i = 0; i < num_users; i++) {
    const firstName = getUniqueFirstName();
    const lastName = getUniqueLastName();
    const fullName = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}_${lastName.toLowerCase()}@tamu.edu`;
    const account = await prisma.account.create({
      data: {
        email,
        name: fullName,
        role: 'USER',
      },
    });
    userAccounts.push(account);
  }
  //console.log('DONE Creating User Accounts\n');


  //console.log('START Creating Professor Accounts\n');
  const professorAccounts = [];
  for (let i = 0; i < num_professors; i++) {

    if(i == 0){
      const firstName = "Professor";
      uniqueFirstNames.add(firstName);
      const lastName = "Doe";
      const fullName = `${firstName} ${lastName}`;
      const email = `professor1.aim@gmail.com`;
      const account = await prisma.account.create({
        data: {
          email,
          name: fullName,
          role: 'PROFESSOR',
        },
      });
      professorAccounts.push(account);
    }
    else{
    const firstName = getUniqueFirstName();
    const lastName = getUniqueLastName();
    const fullName = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}_${lastName.toLowerCase()}@tamu.edu`;
    const account = await prisma.account.create({
      data: {
        email,
        name: fullName,
        role: 'PROFESSOR',
      },
    });
    professorAccounts.push(account);
    }
  }
  //console.log('DONE Creating Professor Accounts\n');

  //console.log('START Creating ADVISOR Accounts\n');
  // Create 5 advisor accounts
  const advisorAccounts = [];
  for (let i = 0; i <  num_advisors; i++) {

    if(i == 0){
      const firstName = "Advisor";
      uniqueFirstNames.add(firstName);
      const lastName = "Doe";
      const fullName = `${firstName} ${lastName}`;
      const email = `advisor.aim@gmail.com`;
      const account = await prisma.account.create({
        data: {
          email,
          name: fullName,
          role: 'ADVISOR',
        },
      });
      advisorAccounts.push(account);
      }
    else{
      const firstName = getUniqueFirstName();
      const lastName = getUniqueLastName();
      const fullName = `${firstName} ${lastName}`;
      const email = `${firstName.toLowerCase()}_${lastName.toLowerCase()}@tamu.edu`;
      
      const account = await prisma.account.create({
        data: {
          email,
          name: fullName,
          role: 'ADVISOR',
        },
      });
      advisorAccounts.push(account);
    }
  }

  //console.log('DONE Creating ADVISOR Accounts\n');

  // --- Create Dependent Records ---


  //console.log('START Creating Students\n');
  // Create 5 Student records (linked to student accounts)
  const students = [];
  for (let i = 0; i < num_students; i++) {
    const account = studentAccounts[i];
    const student = await prisma.student.create({
      data: {
        userId: account.id,
        dob: faker.date.past(20, new Date('2003-01-01')),
        UIN: generateUniqueUIN(),
        phone_number: faker.phone.number('##########'),

      },
    });
    students.push(student);
  }
  //console.log('Done Creating Students\n');


  //console.log('START Creating Users\n');
  const users = [];
  for (let i = 0; i < num_users; i++) {
    const account = userAccounts[i];
    const user = await prisma.user.create({
      data: {
        userId: account.id,
        dob: faker.date.past(20, new Date('2003-01-01')),
        UIN: generateUniqueUIN(),
        phone_number: faker.phone.number('##########'),
      },
    });
    users.push(user);
  }
  //console.log('DONE Creating Users\n');


  //console.log('START Creating Professors\n');
  const departments = ["College of Agriculture and Life Sciences",
    "College of Architecture",
    "College of Arts and Sciences",
    "Mays Business School",
    "College of Dentistry",
    "College of Education and Human Development",
    "College of Engineering",
    "School of Engineering Medicine",
    "Bush School of Government and Public Service",
    "School of Law",
    "College of Marine Sciences and Maritime Studies",
    "College of Medicine",
    "College of Nursing",
    "College of Performance, Visualization and Fine Arts",
    "Irma Lerma Rangel College of Pharmacy",
    "School of Public Health",
    "College of Veterinary Medicine and Biomedical Sciences"];
  // Create 5 Professor records (linked to professor accounts)
  const professors = [];
  for (let i = 0; i < num_professors; i++) {
    const account = professorAccounts[i];
    const professor = await prisma.professor.create({
      data: {
        userId: account.id,
        department: faker.helpers.arrayElement(departments),
      },
    });
    professors.push(professor);
  }
  //console.log('DONE Creating Professors\n');


  //console.log('START Creating Advisors\n');
  const advisors = [];
  for (let i = 0; i < num_advisors; i++) {
    const account = advisorAccounts[i];
    const advisor = await prisma.advisor.create({
      data: {
        userId: account.id,
        role: faker.helpers.arrayElement(['Admin','Coordinator','Testing_Staff','Tech_Staff']),

      },
    });
    advisors.push(advisor);
  }
  //console.log('DONE Creating Advisors\n');

  //settings
  //console.log('START Creating Settings\n');
  for (let i = 0; i < num_students; i++) {
    const account = studentAccounts[i];
    await prisma.settings.create({
      data: {
        userId: account.id,
      },
    });
  }
  for (let i = 0; i < num_professors; i++) {
    const account = professorAccounts[i];
    await prisma.settings.create({
      data: {
        userId: account.id,
      },
    });
  }
  for (let i = 0; i < num_advisors; i++) {
    const account = advisorAccounts[i];
    await prisma.settings.create({
      data: {
        userId: account.id,
      },
    });
  }
  for (let i = 0; i < num_users; i++) {
    const account = userAccounts[i];
    await prisma.settings.create({
      data: {
        userId: account.id,
      },
    });
  }
  //console.log('DONE Creating Settings\n');




  // Create 5 Forms (associate these with student accounts)
  //console.log('START Creating Forms\n');
  const formTypes = [
    ['REGISTRATION_ELIGIBILITY', 
      'Application for Disability Services',
      'Medical or Psychological Documentation Form',
      'Consent for Release of Information'
    ],
    ['ACADEMIC_CLASSROOM',
      'Accommodation Request Form',
      'Alternative Testing Request Form',
      'Note-Taker Agreement Form',
      'Request for Course Substitution',
      'Priority Registration Request',
      'Reduced Course Load Request',
      'Assistive Technology Request',
      'Interpreter or Captioning Request',
    ],
    ['CAMPUS_LIVING_MOBILITY',
      'Housing Accommodation Request',
      'Emotional Support Animal (ESA) Request',
      'Service Animal Registration',
      'Transportation Assistance Form',
    ],
    ['APPEALS_TEMP_WORKPLACE',
      'Temporary Accommodations Request',
      'Internship/Workplace Accommodation Request',
      'Appeal or Grievance Form',
    ]
  ];
  for (let i = 0; i < num_students; i++) {
    const account = studentAccounts[i % studentAccounts.length];
    for(let j = 0; j < Math.floor(Math.random()*4); j++){
      form_t_num = Math.floor(Math.random() * formTypes.length)
      form_name_num = Math.floor(Math.random() * (formTypes[form_t_num].length - 1) + 1)
      await prisma.form.create({
        data: {
          name: formTypes[form_t_num][form_name_num],
          type: formTypes[form_t_num][0],
          status: faker.helpers.arrayElement(['OVERDUE','PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED']),
          dueDate: faker.date.future(),
          userId: account.id,
        },
      });
    }
  }
  //console.log('DONE Creating Forms\n');

  
  //console.log('START Creating Important_Dates\n');
  const important_dates = [
['break',
'spring break',
'winter break',
'summer break',
'fall break',
'thanksgiving break'],

['Office Closure',
'MLK Day',
'Christmas',
'New Years Eve',
'Labor Day'],

['Weather',
'Winter Storm',
'Monsoon',
'Hurricane'],

['Deadline',
'accomodations application deadline',
'early registration deadline',
'q-drop deadline',
'testing request deadline']
];
  // Create all Important_Dates records
  for(let i = 0; i < important_dates.length; i++){
    for(let j = 1; j<important_dates[i].length; j++){
      await prisma.important_Dates.create({
        data: {
          type: important_dates[i][0],
          name: important_dates[i][j],
          date: faker.date.future(),
          },
      });
    }
  }
  //console.log('Done Creating Important_Dates\n');


  //console.log('START Creating Testing_Rooms\n');
  // TESTING ROOMS **FIGURE THIS SHIT OUT LATER!**
  for (let i = 0; i < 5; i++) {
    await prisma.testing_Room.create({
      data: {
        location: faker.location.streetAddress(),
        available: faker.datatype.boolean(),
      },
    });
  }
  //console.log('DONE Creating Testing_Rooms\n');



  //console.log('START Creating AsstTech\n');
  // Create 5 Assistive_Technology records (each needs a student and an advisor)
  for (let i = 0; i < 300; i++) {
    
    const student = students[Math.floor(Math.random()*students.length)];
    const advisor = advisors[Math.floor(Math.random()*advisors.length)];

    await prisma.assistive_Technology.create({
      data: {
        available: faker.datatype.boolean(),
        studentId: student.userId,
        type: faker.helpers.arrayElement(["Screen Reader", "Braille Writer", "Smart Wheelchairs", "Speech-to-Text/Text-to-Speech", "Specialty Mouse and Keyboard", "Smart Pens"]),
        advisorId: advisor.userId,
      },
    });
  }
  //console.log('DONE Creating AsstTech\n');

  //console.log('START Creating Accommodations\n');
  // Create 5 Accommodations records (each linked to an advisor)
  for (let i = 0; i < num_students*2; i++) {
    const advisor = advisors[Math.floor(Math.random()*advisors.length)];
    const student = students[Math.floor(Math.random()*students.length)];
    await prisma.accommodations.create({
      data: {
        type: faker.helpers.arrayElement(["Extended Time", 
          "Note-Taking Assistance",
          "Alternative Format Materials",
          "Accessible Seating",
          "Reduced Distraction Testing Environment",
          "Use of Assistive Technology",
          "Interpreter Services",
          "Audio/Visual Aids",
          "Flexibility with Attendance",
          "Modified Assignments"]),
        status: faker.helpers.arrayElement(['PENDING', 'APPROVED', 'DENIED']),
        advisorId: advisor.userId,
        studentId: student.userId,
        notes: faker.lorem.paragraph(),
      },
    });
  }
  //console.log('DONE Creating Accommodations\n');

  
  //console.log('START Creating Requests\n');
  // Create 5 Request records (each connects a student and an advisor)
  for (let i = 0; i < num_students; i++) {
    const user = users[i % users.length];
    const advisor = advisors[i % advisors.length];
    await prisma.request.create({
      data: {
        non_registered_userId: user.userId,
        advisorId: advisor.userId,
        notes: faker.lorem.paragraph(),
        documentation: faker.datatype.boolean(),
      },
    });
  }
  //console.log('DONE Creating Requests\n');


  //================================================== UP TO HERE WORKS AS INTENDED ==================================================

  //console.log('START Creating Courses\n');
  const course_letters = {
    "College of Agriculture and Life Sciences":"AGSC",
    "College of Architecture":"ARCH",
    "College of Arts and Sciences":"ARTS",
    "Mays Business School":"BUSN",
    "College of Dentistry":"DENT",
    "College of Education and Human Development":"EDUC",
    "College of Engineering":"ENGR",
    "School of Engineering Medicine":"BMEN",
    "Bush School of Government and Public Service":"GOVT",
    "School of Law":"LAWX",
    "College of Marine Sciences and Maritime Studies":"OCEA",
    "College of Medicine":"MEDC",
    "College of Nursing":"NURS",
    "College of Performance, Visualization and Fine Arts":"PERF",
    "Irma Lerma Rangel College of Pharmacy":"PHAR",
    "School of Public Health":"HLTH",
    "College of Veterinary Medicine and Biomedical Sciences":"VETS"
  }

  // Create 5 Courses (each linked to a professor)

  const courses = [];
  for (let i = 0; i < num_professors; i++) {
    const professor = professors[i % professors.length];
    for (let j = 0; j < 2; j++){
      let course_num = Math.floor(Math.random()*999)
      const course = await prisma.course.create({
        data: {
          name: course_letters[professor.department] + " " + String(course_num),
          department: professor.department,
          professorId: professor.userId,
        },
      });
      courses.push(course);
    }
  }
  //console.log('DONE Creating Courses\n');


  //console.log('START Creating Exams\n');
  const buildings = ["HRBB", "HELD", "ZACH",  "EVAN", "COKE", "ILCB", "EABA", "CHEM", "LANG", "ARCA"];
  // Create 5 Exams (each linked to a course and an advisor)
  for (let i = 0; i < courses.length; i++) {
    const course = courses[i % courses.length];
    const advisor = advisors[i % advisors.length];
    for (let j = 0; j < 3; j++){
      room_num = Math.floor(Math.random()*399)

      await prisma.exam.create({
        data: {
          courseId: course.id,
          date: faker.date.future(),
          location: faker.helpers.arrayElement(buildings) + " " + String(room_num),
          advisorId: advisor.userId,
        },
      });
    }
    
  }
  //console.log('DONE Creating Exams\n');

  //console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
