import csv
import random
from faker import Faker
from datetime import date

fake = Faker()

#=============== generate important dates ===============



# Generate a random date from last year


def generate_important_dates(file_directory):
    
    today = date.today()
    start_date = date(today.year - 1, 1, 1)  # Jan 1st of last year
    end_date = date(today.year - 1, 12, 31)  # Dec 31st of last year
    important_dates = []
    types = ["break", "office closure", "weather", "last_day"]
    names = {"break":["spring break","winter break", "summer break", "fall break", "thanksgiving break"],
             "office closure": ["MLK Day", "Christmas", "New Years Eve", "Labor Day"], 
             "weather": ["Winter Storm", "Monsoon", "Hurricane"],
             "last_day": ["last day"]
             }
    
    for name in names.keys():
        
        for i in names[name]: 
            event_id = fake.uuid4()
            event_type = name
            event_name = i
            event_date = fake.date_between(start_date=start_date, end_date=end_date)
        
            important_dates.append([event_id,event_name,event_type,event_date])

    
    csv_file_path = file_directory + "important_dates.csv"
    with open(csv_file_path, mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(["event_id", "event_name", "event_type", "event_date"])
        writer.writerows(important_dates)

    print(f"Dummy data for students saved to {csv_file_path}")
        
