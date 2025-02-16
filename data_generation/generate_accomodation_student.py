import csv
import random
from faker import Faker
from datetime import date
fake = Faker()

def generate_join_accomodations_students(accomodations, students, file_directory):
    temp_accom = accomodations
    join_accomodation_student = []
    
    for student in students:
        student_id = student[0]
        for i in range(random.randint(1,2)):
            curr_accom = temp_accom[random.randint(0,len(temp_accom)-1)]
            accomodation_id = curr_accom[0]
            #REMOVE ACCOM
            temp_accom.remove(curr_accom)
            join_accomodation_student.append([student_id,accomodation_id])
            
    
    csv_file_path = file_directory + "join_accomodations_student.csv"
    with open(csv_file_path, mode='w', newline='') as file:
        writer = csv.writer(file)
        # Writing header
        writer.writerow([
            "student_id", "accomodation_id"
        ])
        # Writing data rows
        writer.writerows(join_accomodation_student)

    print(f"Dummy data for accomodation|student join table saved to {csv_file_path}")
    return join_accomodation_student