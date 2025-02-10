import csv
import random
from faker import Faker

fake = Faker()

# Number of dummy students to generate
num_students = 100

# Generate dummy student data
students = []
for _ in range(num_students):
    student_id = fake.uuid4()
    name = fake.name()
    dob = fake.date_of_birth(minimum_age=18, maximum_age=30).strftime('%Y-%m-%d')
    email = fake.email()
    uni = fake.random_int(min=100000, max=999999)
    phone_number = fake.phone_number()
    date_registered = fake.date_this_decade().strftime('%Y-%m-%d')
    registered_disabilities = fake.random_element(elements=[None, "Dyslexia", "ADHD", "Hearing Impairment", "Vision Impairment"])
    available_accommodations = fake.random_element(elements=["Extended Time", "Note Taker", "Braille Materials", "Quiet Room"])
    courses = [fake.uuid4() for _ in range(random.randint(1, 5))]  # Simulating foreign keys to courses
    deadlines_dates = [fake.uuid4() for _ in range(random.randint(1, 3))]  # Simulating foreign keys to Important Dates

    students.append([
        student_id, name, dob, email, uni, phone_number, date_registered,
        registered_disabilities, available_accommodations, ";".join(courses), ";".join(deadlines_dates)
    ])

# CSV file path
csv_file_path = "students.csv"

# Writing to CSV file
with open(csv_file_path, mode='w', newline='') as file:
    writer = csv.writer(file)
    # Writing header
    writer.writerow([
        "student_id", "name", "dob", "email", "uni", "phone_number", "date_registered",
        "registered_disabilities", "available_accommodations", "courses", "deadlines_dates"
    ])
    # Writing data rows
    writer.writerows(students)

print(f"Dummy data for students saved to {csv_file_path}")
