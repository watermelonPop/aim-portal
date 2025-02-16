import csv
import random
from faker import Faker
from datetime import date
fake = Faker()

def generate_exam_scheduling(courses,advisors, file_directory):

    exam_scheduling = []
    for course in courses:
        
        for i in range(random.randint(2,5)):
            exam_id = fake.uuid4()
            course_id = course[0]
               
            today = date.today()
            start_date = date(today.year - 1, 1, 1)  # Jan 1st of last year
            end_date = date(today.year - 1, 12, 31)  # Dec 31st of last year
            
            scheduled_date = fake.date_between(start_date=start_date, end_date=end_date)
            
            exam_location = fake.random_element(elements=["HRBB", "HELD", "ZACH",  "EVAN", "COKE", "ILCB", "EABA", "CHEM", "LANG", "ARCA"]) + " " + str(random.randint(100,399))
            approved_by = advisors[random.randint(0,len(advisors)-1)][0]
            
            
            
            exam_scheduling.append([exam_id, course_id, scheduled_date, exam_location, approved_by])
        
        
        
    csv_file_path = file_directory+"exam_scheduling.csv"
    with open(csv_file_path, mode='w', newline='') as file:
        writer = csv.writer(file)
        # Writing header
        writer.writerow([ "exam_id", "course_id","scheduled_date", "exam_location", "approved_by"])
        # Writing data rows
        writer.writerows(exam_scheduling)

    print(f"Dummy data for exam scheduling saved to {csv_file_path}")
    
    #return UserIDs
    return exam_scheduling