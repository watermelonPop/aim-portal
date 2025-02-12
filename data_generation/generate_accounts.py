import csv
import random
from faker import Faker

fake = Faker()

accounts = []

def generate_accounts(num_accounts):
    for _ in range(num_accounts):
        user_id = fake.uuid4()
        user_email = f"{fake.user_name()}@tamu.edu"
        user_password = fake.uuid4()
        user_role = fake.random_element(elements=["Student", "Professor", "Advisor"])

        accounts.append([ user_id, user_email, user_password, user_role ])

    csv_file_path = "/Users/unamazin/Documents/GitHub/aim-portal/data_generation/data/accounts.csv"
    with open(csv_file_path, mode='w', newline='') as file:
        writer = csv.writer(file)
        # Writing header
        writer.writerow([ "user_id", "user_email", "user_password", "user_role" ])
        # Writing data rows
        writer.writerows(accounts)

    print(f"Dummy data for accounts saved to {csv_file_path}")

# generate_accounts(number of total accounts = students + profs + admins)