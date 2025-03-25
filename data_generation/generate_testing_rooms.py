import csv
import random
from faker import Faker
from datetime import date

fake = Faker()

#=============== generate forms ===============

def generate_testing_rooms(file_directory):
    
    # today = date.today()
    # start_date = date(today.year - 1, 1, 1)  # Jan 1st of last year
    # end_date = date(today.year - 1, 12, 31)  # Dec 31st of last year

    testing_rooms = []
        
    for i in range(50): 
        room_id = fake.uuid4()
        room_location = f"Student Services Building Room {i}"
        room_available = fake.pybool()
        
        testing_rooms.append([room_id, room_location, room_available])

    
    csv_file_path = file_directory + "testing_rooms.csv"
    with open(csv_file_path, mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(["room_id", "room_location", "room_available"])
        writer.writerows(testing_rooms)
        
    

    print(f"Dummy data for testing rooms saved to {csv_file_path}")
    
    return testing_rooms
        
