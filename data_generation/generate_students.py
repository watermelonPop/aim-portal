import csv
import random
from faker import Faker
from datetime import date
fake = Faker()

generated_uins = set()

def generate_students(student_accounts, advisors, file_directory):

    students = []
    for account in student_accounts:
        student_id = account[0]
        name = account[4]
        dob = fake.date_of_birth(minimum_age=18, maximum_age=30).strftime('%Y-%m-%d')
        email = account[1]
        
        
        num = fake.random_int(min=1000000, max=9999999)
        while num in generated_uins:
            num = fake.random_int(min=1000000, max=9999999)
            
        generated_uins.add(num)
        uin = int(str(num)[:2]+"00"+str(num)[3:])
        phone_number = fake.phone_number()
        date_registered = fake.date_this_decade().strftime('%Y-%m-%d')
        registered_disabilities = fake.random_element(elements=["None", "Dyslexia", "ADHD", "Hearing Impairment", "Vision Impairment", "Anxiety","Depression","Physical Impairment"])
        
        advisor_id = fake.random_element(elements=[ad_id[0] for ad_id in advisors if ad_id[3]=="Coordinator"])
        
        
        #MAKE ADVISOR
        
        students.append([
            student_id, name, dob, email, uin, phone_number, date_registered,
            registered_disabilities, advisor_id
        ])
        
    # Writing to CSV file
    csv_file_path = "/Users/unamazin/Documents/GitHub/aim-portal/data_generation/data/students.csv"
    with open(csv_file_path, mode='w', newline='') as file:
        writer = csv.writer(file)
        # Writing header
        writer.writerow([
            "student_id", "name", "dob", "email", "uin", "phone_number", "date_registered",
            "registered_disabilities", "advisor_id"
        ])
        # Writing data rows
        writer.writerows(students)

    print(f"Dummy data for students saved to {csv_file_path}")
    return students