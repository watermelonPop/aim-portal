import json
import random
from faker import Faker

fake = Faker()

def generate_accounts(num_accounts, file_directory: str):
    accounts = []

    for _ in range(num_accounts):
        user_id = fake.uuid4()
        user_name = fake.name()
        
        user_first_and_last = user_name.split(" ")
        user_name_for_email = (user_first_and_last[0][0] + user_first_and_last[1]).lower()
        user_email = f"{user_name_for_email}@tamu.edu"
        
        user_password = fake.uuid4()
        roles = ["Student", "Professor", "Advisor", "User"]
        weights = [6, 1, 1, 2]  # 8:1:1 ratio

        # Generate a single user role with the correct ratio
        user_role = random.choices(roles, weights=weights, k=1)[0]

        accounts.append({
            "user_id": str(user_id),
            "user_email": user_email,
            "user_password": str(user_password),
            "user_role": user_role,
            "name": user_name
        })

    json_file_path = file_directory + "accounts.json"
    with open(json_file_path, mode='w') as file:
        json.dump(accounts, file, indent=4)

    print(f"Dummy data for accounts saved to {json_file_path}")

    return accounts
