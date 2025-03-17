import csv
import random
from faker import Faker

fake = Faker()

#GENERATE ACCESSIBILITY SETTINGS
settings = []

def generate_settings(num_accounts, file_directory, user_ids: list):
    for index in range(num_accounts):
        user_id = user_ids[index][0]
        content_size = fake.random_int(min = 1, max = 10000) #percentages of original size (starts at 100)
        highlight_tiles = fake.pybool(20)
        highlight_links = fake.pybool(20)
        text_magnifier = fake.pybool(20)
        align_text = fake.random_element(elements=["None", "Left", "Middle", "Right"])
        font_size = fake.random_int(min=1, max=10000) #percentages of original size (starts at 100)
        line_height = fake.random_int(min=1, max=10000) #percentages of original size (starts at 100)
        letter_spacing = fake.random_int(min=1, max=10000) #percentages of original size (starts at 100)
        contrast = fake.random_element(elements=["Regular", "Dark", "Light", "Monochrome"])
        saturation = fake.random_element(elements=["Regular", "Low", "High", "Monochrome"])
        mute_sounds = fake.pybool(20)
        hide_images = fake.pybool(20)
        reading_mask = fake.pybool(20)
        highlight_hover = fake.pybool(20)
        cursor = fake.random_element(elements=["Regular", "Big Black Cursor", "Big White Cursor"])

        settings.append([
            user_id, content_size, highlight_tiles, highlight_links, text_magnifier, align_text, font_size, line_height, 
            letter_spacing, contrast, saturation, mute_sounds, hide_images, reading_mask, highlight_hover, cursor
        ])

    csv_file_path = file_directory+"settings.csv"
    with open(csv_file_path, mode='w', newline='') as file:
        writer = csv.writer(file)
        # Writing header
        writer.writerow(["settings_id", "user_id", "content_size", "highlight_tiles", "highlight_links", "text_magnifier", "align_text", "font_size",
        "line_height", "letter_spacing", "contrast", "saturation", "mute_sounds", "hide_images", "reading_mask", "highlight_hover", "cursor"])
        # Writing data rows
        writer.writerows(settings)

    print(f"Dummy data for settings saved to {csv_file_path}")

"""
Based on setting options from cartedo's menu (accessiBe)
Accessibility Settings:
Content size: (1 to 10000) 100 is default value and size
Hightlight Tiles: (T/F) False is default
Highlight Links: (T/F) False is default
Text Magnifier: (T/F) False is default
Align Text: Left, Middle, Right
Font Sizing: (1 to 10000) 100 is default value and size
Line Height: (1 to 10000) 100 is default value and size
Letter Spacing: (1 to 10000) 100 is default value and size
Contrast: (Regular, Dark, Light, High) Regular is default
Saturation: (Regular, High, Low, Monochrome) Regular is default
Mute Sounds: (T/F) False is default
Hide Images: (T/F) False is default
Reading Mask: (T/F) False is default
Highlight Hover: (T/F) False is default
Cursor: (Regular, Big Black Cursor, Big White Cursor) Regular is default
"""