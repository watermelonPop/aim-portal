import csv
import random
from faker import Faker
from datetime import date
fake = Faker()

def generate_accomodations(num_accounts,advisors, file_directory):

    accomodations = []
    for account in range(num_accounts):
        #print(account)
        accomodation_id = fake.uuid4()
        accomodation_type=""
        previous_accomodation = ""
        for i in range(random.randint(1,2)):
            
            while accomodation_type == previous_accomodation:
                accomodation_type = fake.random_element(elements=["Extended Time", 
                                                                  "Note-Taking Assistance",
                                                                  "Alternative Format Materials",
                                                                  "Accessible Seating",
                                                                  "Reduced Distraction Testing Environment",
                                                                  "Use of Assistive Technology",
                                                                  "Interpreter Services",
                                                                  "Audio/Visual Aids",
                                                                  "Flexibility with Attendance",
                                                                  "Modified Assignments"])
            previous_accomodation = accomodation_type
            
            """
            roles = ["Student", "Professor", "Advisor"]
            weights = [8, 1, 1]  # 8:1:1 ratio

            # Generate a single user role with the correct ratio
            user_role = random.choices(roles, weights=weights, k=1)[0]
            """
            possible_statuses=["Pending", "Approved","Denied"]
            weights = [2, 10, 1]
            
            status = random.choices(possible_statuses, weights=weights, k=1)[0]
            date_requested = fake.date_this_decade().strftime('%Y-%m-%d')
            approved_by = advisors[random.randint(0,len(advisors)-1)][0]
            notes = fake.paragraph()
            
            accomodations.append([accomodation_id, accomodation_type, status, date_requested, approved_by, notes])
        
        
        
    csv_file_path = file_directory+"accomodations.csv"
    with open(csv_file_path, mode='w', newline='') as file:
        writer = csv.writer(file)
        # Writing header
        writer.writerow([ "accomodation_id", "accomodation_type","status", "date_requested", "approved_by", "notes"])
        # Writing data rows
        writer.writerows(accomodations)

    print(f"Dummy data for accomodations saved to {csv_file_path}")
    
    #return UserIDs
    return accomodations