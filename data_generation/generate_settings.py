import csv
import random
import generate_accounts
from faker import Faker

fake = Faker()

#GENERATE ACCESSIBILITY SETTINGS

def generate_settings(num_accounts, file_directory, user_ids: list):
    for index in range(num_accounts):
        settings_id = fake.uuid4()
        user_id = generate_accounts.accounts[index]
        content_scaling = fake.random_int(min = -100, max = 1000) #percentages of original size (starts at 100)
        text_size = fake.random_int(min=-100, max=1000) #percentages of original size (starts at 100)
        

"""
Accessibility Settings:
Content size: (1 to 10000) 100 is default value and size
Hightlight Tiles: T/F 
Highlight Links: T/F

"""