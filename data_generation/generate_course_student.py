import csv
import random
from faker import Faker
from datetime import date
fake = Faker()

def generate_join_courses_students(courses, students, file_directory):
    
    join_course_student = []
    
    for student in students:
        student_id = student[0]
        for i in range(random.randint(4,6)):
            course_id = courses[random.randint(0,len(courses)-1)][0]
            join_course_student.append([student_id,course_id])
            
    
    csv_file_path = file_directory + "join_courses_student.csv"
    with open(csv_file_path, mode='w', newline='') as file:
        writer = csv.writer(file)
        # Writing header
        writer.writerow([
            "student_id", "course_id"
        ])
        # Writing data rows
        writer.writerows(join_course_student)

    print(f"Dummy data for course|student join table saved to {csv_file_path}")
    return join_course_student