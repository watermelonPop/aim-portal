import json
import random
from faker import Faker
from datetime import date

fake = Faker()

def generate_accommodations(num_accounts, advisors, file_directory):
    accommodations = []

    for account in range(num_accounts):
        accommodation_id = fake.uuid4()
        accommodation_type = ""
        previous_accommodation = ""

        for _ in range(random.randint(1, 2)):
            while accommodation_type == previous_accommodation:
                accommodation_type = fake.random_element(elements=[
                    "Extended Time",
                    "Note-Taking Assistance",
                    "Alternative Format Materials",
                    "Accessible Seating",
                    "Reduced Distraction Testing Environment",
                    "Use of Assistive Technology",
                    "Interpreter Services",
                    "Audio/Visual Aids",
                    "Flexibility with Attendance",
                    "Modified Assignments"
                ])
            previous_accommodation = accommodation_type

            possible_statuses = ["Pending", "Approved", "Denied"]
            weights = [2, 10, 1]  # Bias towards "Approved"

            status = random.choices(possible_statuses, weights=weights, k=1)[0]
            date_requested = fake.date_this_decade().strftime('%Y-%m-%d')
            approved_by = advisors[random.randint(0, len(advisors) - 1)][0]
            notes = fake.paragraph()

            accommodations.append({
                "accommodation_id": str(accommodation_id),
                "accommodation_type": accommodation_type,
                "status": status,
                "date_requested": date_requested,
                "approved_by": approved_by,
                "notes": notes
            })

    json_file_path = file_directory + "accommodations.json"
    with open(json_file_path, mode='w') as file:
        json.dump(accommodations, file, indent=4)

    print(f"Dummy data for accommodations saved to {json_file_path}")

    return accommodations
