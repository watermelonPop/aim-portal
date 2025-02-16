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

def generate_professors(professor_accounts, file_directory):

    professors = []
    for account in professor_accounts:
        professor_id = account[0]
        name = account[4]
        email = account[1]
        department = fake.random_element(elements=departments)

        professors.append([professor_id, name, email, department])

        
    csv_file_path = file_directory + "professors.csv"
    with open(csv_file_path, mode='w', newline='') as file:
        writer = csv.writer(file)
        # Writing header
        writer.writerow([
            "professor_id", "name", "email", "department"
        ])
        # Writing data rows
        writer.writerows(professors)

    print(f"Dummy data for professors saved to {csv_file_path}")

    return professors