import csv
import random
from faker import Faker
from datetime import date
fake = Faker()

def generate_advisors(advisor_accounts, file_directory):

    advisors = []
    for account in advisor_accounts:
        #print(account)
        user_id = account[0]
        name = account[4]
        email = account[1]
        role = fake.random_element(elements=["Admin", "Coordinator", "Testing Staff", "Tech Staff"])
        advisors.append([user_id,name,email,role])
        
        
    csv_file_path = file_directory+"advisors.csv"
    with open(csv_file_path, mode='w', newline='') as file:
        writer = csv.writer(file)
        # Writing header
        writer.writerow([ "user_id", "name","email", "role"])
        # Writing data rows
        writer.writerows(advisors)

    print(f"Dummy data for advisors saved to {csv_file_path}")
    
    #return UserIDs
    return advisors