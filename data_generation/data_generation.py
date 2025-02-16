import csv
import random
import generate_accounts
import generate_students
import generate_settings
import generate_important_dates
import generate_advisors
import generate_professors
import generate_courses
import generate_course_student
import generate_accomodations
import generate_accomodation_student
import generate_exam_scheduling

"""
TODO: 
Assistive Technology
Testing Center

DOING:
Forms


DONE: 
Important Dates
Accounts
Accessibility Settings
Advisor
Student
Professors
Courses
Course | Students Join table
Accomodations
Accomodations | Students Join table
Exam Scheduling


"""


file_destination = "/Users/unamazin/Documents/GitHub/aim-portal/data_generation/data/"

#Need User_id, email, and role
#user_ids = []

important_dates = generate_important_dates.generate_important_dates(file_directory=file_destination)
accounts = generate_accounts.generate_accounts(num_accounts=2000,file_directory=file_destination)
generate_settings.generate_settings(num_accounts=2000,file_directory=file_destination, user_ids=accounts)

#filter and sort user ids by the role
professor_accounts = [account for account in accounts if account[3] == "Professor"]
student_accounts = [account for account in accounts if account[3] == "Student"]
advisor_accounts = [account for account in accounts if account[3] == "Advisor"]


advisors = generate_advisors.generate_advisors(advisor_accounts=advisor_accounts,file_directory=file_destination)
professors = generate_professors.generate_professors(professor_accounts=professor_accounts,file_directory=file_destination)
students = generate_students.generate_students(student_accounts=student_accounts,advisors=advisors, file_directory=file_destination)

courses = generate_courses.generate_courses(professors=professors,file_directory=file_destination)
join_course_student = generate_course_student.generate_join_courses_students(students=students,courses=courses,file_directory=file_destination)

accomodations = generate_accomodations.generate_accomodations(num_accounts=3000,advisors=advisors,file_directory=file_destination)
join_accomodation_student = generate_accomodation_student.generate_join_accomodations_students(accomodations=accomodations,students=students,file_directory=file_destination)

generate_exam_scheduling.generate_exam_scheduling(courses=courses, advisors=advisors,file_directory=file_destination)