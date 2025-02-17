import csv
import random
from faker import Faker
from datetime import date

fake = Faker()

#=============== generate forms ===============

def generate_forms(file_directory):
    
    today = date.today()
    start_date = date(today.year - 1, 1, 1)  # Jan 1st of last year
    end_date = date(today.year - 1, 12, 31)  # Dec 31st of last year

    forms = []
    types = ["Registration & Eligibility", "Academic & Classroom Accommodations", "Campus Living & Mobility Accommodations", "Appeals, Temporary & Workplace Accommodations"]
    names = {"Registration & Eligibility":["Application for Disability Services", "Medical or Psychological Documentation Form", "Consent for Release of Information"],
             "Academic & Classroom Accommodations": ["Accommodation Request Form", "Alternative Testing Request Form", "Note-Taker Agreement Form", "Request for Course Substitution", 
                                                     "Priority Registration Request", "Reduced Course Load Request", "Assistive Technology Request", "Interpreter or Captioning Request"], 
             "Campus Living & Mobility Accommodations": ["Housing Accommodation Request", "Emotional Support Animal (ESA) Request", "Service Animal Registration", "Transportation Assistance Form"],
             "Appeals, Temporary & Workplace Accommodations": ["Temporary Accommodations Request", "Internship/Workplace Accommodation Request", "Appeal or Grievance Form"]
             }
    
    for name in names.keys():
        
        for i in names[name]: 
            form_id = fake.uuid4()
            form_type = name
            form_name = i
            form_status = fake.random_element(elements=["Overdue", "Pending", "Submitted", "Approved", "Rejected"])
            form_submitted_date = form_submitted_date = fake.date_between(start_date=start_date, end_date=today) if form_status in ["Submitted", "Approved", "Rejected"] else date(today.year + 1, 1, 1)
            form_due_date = fake.date_between(start_date=start_date, end_date=today) if form_status in ["Submitted", "Approved", "Rejected"] else fake.date_between(start_date=today, end_date=end_date)
        
            forms.append([form_id,form_name,form_type,form_status, form_submitted_date, form_due_date])

    
    csv_file_path = file_directory + "forms.csv"
    with open(csv_file_path, mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(["form_id", "form_name", "form_type", "form_status", "form_submitted_date", "form_due_date"])
        writer.writerows(forms)
        
    

    print(f"Dummy data for forms saved to {csv_file_path}")
    
    return forms
        
