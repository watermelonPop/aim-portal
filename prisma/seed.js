// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');
const prisma = new PrismaClient();

async function main() {
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
  const studentAccounts = [];
  for (let i = 0; i < num_students; i++) {
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

  const professorAccounts = [];
  for (let i = 0; i < num_professors; i++) {
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

  // Create 5 advisor accounts
  const advisorAccounts = [];
  for (let i = 0; i <  num_professors; i++) {
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

  // --- Create Dependent Records ---

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

  // Create 5 Professor records (linked to professor accounts)
  const professors = [];
  for (let i = 0; i < num_professors; i++) {
    const account = professorAccounts[i];
    const professor = await prisma.professor.create({
      data: {
        userId: account.id,
        department: faker.helpers.arrayElement(['Mays Business School', 'College of Dentistry', 'College of Architecture', 'College of Nursing', 'College of Medicine', 'School of Law','College of Engineering']),
      },
    });
    professors.push(professor);
  }

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

  //settings
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




  // Create 5 Forms (associate these with student accounts)
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
          dueDate: faker.date.future(),
          userId: account.id,
        },
      });
    }
  }

  //================================================== UP TO HERE WORKS AS INTENDED ==================================================


  // Create 5 Important_Dates records
  for (let i = 0; i < 5; i++) {
    await prisma.important_Dates.create({
      data: {
        type: faker.lorem.word(),
        name: faker.lorem.words(2),
        date: faker.date.future(),
      },
    });
  }

  // Create 5 Testing_Room records
  for (let i = 0; i < 5; i++) {
    await prisma.testing_Room.create({
      data: {
        location: faker.location.streetAddress(),
        available: faker.datatype.boolean(),
      },
    });
  }

  // Create 5 Assistive_Technology records (each needs a student and an advisor)
  for (let i = 0; i < 5; i++) {
    const student = students[i % students.length];
    const advisor = advisors[i % advisors.length];
    await prisma.assistive_Technology.create({
      data: {
        available: faker.datatype.boolean(),
        studentId: student.userId,
        type: faker.lorem.word(),
        advisorId: advisor.userId,
      },
    });
  }

  // Create 5 Accommodations records (each linked to an advisor)
  for (let i = 0; i < 100; i++) {
    const advisor = advisors[i % advisors.length];
    const student = students[i%students.length];
    await prisma.accommodations.create({
      data: {
        type: faker.helpers.arrayElement(['Use of Assistive Technology', 'Reduced Distraction Testing Environment', 'Interpreter Services', 'Interpreter Services','Modified Assignments','Note-Taking Assistance','Audio/Visual Aids']),
        status: faker.helpers.arrayElement(['PENDING', 'APPROVED', 'DENIED']),
        advisorId: advisor.userId,
        studentId: student.userId,
        notes: faker.lorem.paragraph(),
      },
    });
  }

  // Create 5 Request records (each connects a student and an advisor)
  for (let i = 0; i < 5; i++) {
    const student = students[i % students.length];
    const advisor = advisors[i % advisors.length];
    await prisma.request.create({
      data: {
        // Set the id to match the student's userId per your schema
        id: student.userId,
        advisorId: advisor.userId,
        notes: faker.lorem.sentence(),
        documentation: faker.datatype.boolean(),
      },
    });
  }

  // Create 5 Courses (each linked to a professor)
  const courses = [];
  for (let i = 0; i < 5; i++) {
    const professor = professors[i % professors.length];
    const course = await prisma.course.create({
      data: {
        name: faker.lorem.words(2),
        department: faker.commerce.department(),
        professorId: professor.userId,
      },
    });
    courses.push(course);
  }

  // Create 5 Exams (each linked to a course and an advisor)
  for (let i = 0; i < 5; i++) {
    const course = courses[i % courses.length];
    const advisor = advisors[i % advisors.length];
    await prisma.exam.create({
      data: {
        courseId: course.id,
        date: faker.date.future(),
        location: faker.location.streetAddress(),
        advisorId: advisor.userId,
      },
    });
  }

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
