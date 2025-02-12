import csv
import random
import generate_accounts
import generate_students
import generate_settings
import generate_important_dates

"""
TODO: 
Advisor
Accomodations
Exam Scheduling
Assistive Technology
Forms
Testing Center


DOING:
Student
Professors
Courses


DONE: 
Important Dates
Accounts
Accessibility Settings


"""


file_destination = "/Users/unamazin/Documents/GitHub/aim-portal/data_generation/data/"

#Need User_id, email, and role
#user_ids = []

important_dates = generate_important_dates.generate_important_dates(file_directory=file_destination)
user_ids = generate_accounts.generate_accounts(num_accounts=2000,file_directory=file_destination)
generate_settings.generate_settings(num_accounts=2000,file_directory=file_destination, user_ids=user_ids)

#filter and sort user ids by the role
professor_accounts = [account for account in user_ids if account[3] == "Professor"]
student_accounts = [account for account in user_ids if account[3] == "Student"]
advisor_accounts = [account for account in user_ids if account[3] == "Advisor"]

#generate_students.generate_students(student_accounts=student_accounts, important_dates=important_dates, file_directory=file_destination)



#print(user_ids)