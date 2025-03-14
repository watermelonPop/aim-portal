import csv
import random
from faker import Faker

fake = Faker()

accounts = []
user_ids = []
def generate_accounts(num_accounts, file_directory: str):
    for _ in range(num_accounts):
        user_id = fake.uuid4()
        #user_ids.append(user_id)
        user_name = fake.name()
        
        user_first_and_last = user_name.split(" ")
        user_name_for_email = (user_first_and_last[0][0] + user_first_and_last[1]).lower()
        user_email = f"{user_name_for_email}@tamu.edu"
        
        
        user_password = fake.uuid4()
        roles = ["Student", "Professor", "Advisor", "User"]
        weights = [6, 1, 1,2]  # 8:1:1 ratio

        # Generate a single user role with the correct ratio
        user_role = random.choices(roles, weights=weights, k=1)[0]

        accounts.append([ user_id, user_email, user_password, user_role, user_name])
        
    
    # #FAKE ADVISOR
    # user_id = fake.uuid4()
    

    csv_file_path = file_directory+"accounts.csv"
    with open(csv_file_path, mode='w', newline='') as file:
        writer = csv.writer(file)
        # Writing header
        writer.writerow([ "user_id", "user_email", "user_password", "user_role", "name"])
        # Writing data rows
        writer.writerows(accounts)

    print(f"Dummy data for accounts saved to {csv_file_path}")
    
    #return UserIDs
    return accounts

#generate_accounts(2000)