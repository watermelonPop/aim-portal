import csv
import random
from faker import Faker
from datetime import date

fake = Faker()

#=============== generate forms ===============

def generate_assistive_technologies(students, advisors, file_directory):
    
    # today = date.today()
    # start_date = date(today.year - 1, 1, 1)  # Jan 1st of last year
    # end_date = date(today.year - 1, 12, 31)  # Dec 31st of last year

    assistive_technologies = []
    types = ["Screen Reader", "Braille Writer", "Smart Wheelchairs", "Speech-to-Text/Text-to-Speech", "Specialty Mouse and Keyboard", "Smart Pens"]
    
    for type in types:
        
        for i in range(100): 
            technology_id = fake.uuid4()
            technology_in_use = fake.pybool(20)
            student_in_use = students[random.randint(0,len(students)-1)]
            device_type = type
            assigned_by = advisors[random.randint(0,len(advisors)-1)]
        
            assistive_technologies.append([technology_id, technology_in_use, student_in_use, device_type, assigned_by])

    
    csv_file_path = file_directory + "assistive_technologies.csv"
    with open(csv_file_path, mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(["technology_id", "technology_in_use", "student_in_use", "device_type", "assigned_by"])
        writer.writerows(assistive_technologies)
        
    

    print(f"Dummy data for assistive technologies saved to {csv_file_path}")
    
    return assistive_technologies
        
