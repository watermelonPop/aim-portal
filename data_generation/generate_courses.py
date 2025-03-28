import csv
import random
from faker import Faker
from datetime import date
fake = Faker()

#generated_uins = set()
departments = [
    "College of Agriculture and Life Sciences",
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
    "College of Veterinary Medicine and Biomedical Sciences"
]

course_letters = {
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

def generate_courses(professors, file_directory):

    courses = []
    for professor in professors:
        professor_id = professor[0]
        department = professor[3]
        
        for i in range(random.randint(1,4)):
            course_id = fake.uuid4()
            course_name = course_letters[department] +" "+ str(random.randint(100,699))
            courses.append([course_id, course_name, department,professor_id])

        
    csv_file_path = file_directory + "courses.csv"
    with open(csv_file_path, mode='w', newline='') as file:
        writer = csv.writer(file)
        # Writing header
        writer.writerow([
            "course_id", "course_name", "department", "professor_id"
        ])
        # Writing data rows
        writer.writerows(courses)

    print(f"Dummy data for courses saved to {csv_file_path}")

    return courses