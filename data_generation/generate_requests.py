import csv
import random
from faker import Faker

fake = Faker()

requests = []

def generate_requests(users, advisors, file_directory: str):
    for user in users:
        user_id = user[0]
        advisor_id = fake.random_element(advisors)[0]
        dob = fake.date_of_birth(minimum_age=18, maximum_age=30).strftime('%Y-%m-%d')
        
        
        generated_uins = set()
        num = fake.random_int(min=1000000, max=9999999)
        while num in generated_uins:
            num = fake.random_int(min=1000000, max=9999999)
            
        generated_uins.add(num)
        uin = int(str(num)[:2]+"00"+str(num)[3:])
        
        phone_number = fake.phone_number()
        
        notes = fake.paragraph()
        
        
        #1 and 4
        user_name = user[1]
        user_email = user[4]
        


        requests.append([ user_id,user_name,user_email,advisor_id, dob, uin, phone_number, notes])
        

    csv_file_path = file_directory+"requests.csv"
    with open(csv_file_path, mode='w', newline='') as file:
        writer = csv.writer(file)
        # Writing header
        writer.writerow([ "user_id","user_name","user_email", "advisor_id", "dob", "uin", "phone_number", "notes"])
        # Writing data rows
        writer.writerows(requests)

    print(f"Dummy data for accounts saved to {csv_file_path}")
    
    #return UserIDs
    return requests

#generate_accounts(2000)