import csv
import random
import generate_accounts
import generate_students
import generate_settings
import generate_important_dates

"""
TODO: 
Professor

Advisor
Accomodations
Course
Exam Scheduling
Assistive Technology
Forms
Testing Center


DOING:
Student
Accessibility Settings

DONE: 
Important Dates
Accounts


"""


file_destination = "/Users/unamazin/Documents/GitHub/aim-portal/data_generation/data/"

user_ids = []

generate_important_dates.generate_important_dates(file_directory=file_destination)
user_ids = generate_accounts.generate_accounts(num_accounts=2000,file_directory=file_destination)
print(user_ids)