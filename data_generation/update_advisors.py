import os
import psycopg2
from psycopg2 import sql

# Retrieve your NeonDB connection string from an environment variable.
# For example: postgresql://username:password@host:port/database?sslmode=require
connection_string = ""

if not connection_string:
    raise Exception("Please set the NEONDATABASE_URL environment variable with your NeonDB connection string.")

try:
    # Connect to the database
    conn = psycopg2.connect(connection_string)
    cursor = conn.cursor()

    # Define the columns to add.
    columns = {
        "global_settings": "Global settings",
        "accommodation_modules": "Accommodation modules",
        "note_taking_modules": "Note Taking modules",
        "assistive_tech_modules": "Assistive tech modules",
        "accessible_testing_modules": "Accessible testing modules",
        "student_case_information": "Student case information"
    }

    # Add each column (if it does not already exist)
    for col, description in columns.items():
        query = sql.SQL("ALTER TABLE advisors ADD COLUMN IF NOT EXISTS {} BOOLEAN DEFAULT FALSE")
        query = query.format(sql.Identifier(col))
        cursor.execute(query)
        print(f"Column '{col}' for '{description}' added (if not already existing).")

    # Update rows based on advisor role.
    # For example, if an advisor's role is 'Admin', set all six access flags to TRUE.
    update_admin_query = """
    UPDATE advisors
    SET 
        global_settings = TRUE,
        accommodation_modules = TRUE,
        note_taking_modules = TRUE,
        assistive_tech_modules = TRUE,
        accessible_testing_modules = TRUE,
        student_case_information = TRUE
    WHERE role = 'Admin';
    """
    cursor.execute(update_admin_query)
    print("Updated all advisors with role 'Admin' to have full access.")
    
    
    
    
    update_coordinator_query = """
    UPDATE advisors
    SET 
        global_settings = FALSE,
        accommodation_modules = TRUE,
        note_taking_modules = FALSE,
        assistive_tech_modules = FALSE,
        accessible_testing_modules = FALSE,
        student_case_information = TRUE
    WHERE role = 'Coordinator';
    """
    cursor.execute(update_coordinator_query)
    print("Updated all advisors with role 'Coordinator' to have full access.")
    
    
    
    
    update_testing_staff_query = """
    UPDATE advisors
    SET 
        global_settings = FALSE,
        accommodation_modules = FALSE,
        note_taking_modules = FALSE,
        assistive_tech_modules = FALSE,
        accessible_testing_modules = TRUE,
        student_case_information = TRUE
    WHERE role = 'Testing Staff';
    """
    cursor.execute(update_testing_staff_query)
    print("Updated all advisors with role 'Testing Staff' to have full access.")
    
    
    update_tech_staff_query = """
    UPDATE advisors
    SET 
        global_settings = FALSE,
        accommodation_modules = TRUE,
        note_taking_modules = TRUE,
        assistive_tech_modules = TRUE,
        accessible_testing_modules = FALSE,
        student_case_information = FALSE
    WHERE role = 'Tech Staff';
    """
    cursor.execute(update_tech_staff_query)
    print("Updated all advisors with role 'Tech Staff' to have full access.")

    # If needed, you can add similar queries for other roles.
    # For example:
    # UPDATE advisors
    # SET 
    #   accommodation_modules = TRUE,
    #   note_taking_modules = TRUE,
    #   assistive_tech_modules = TRUE,
    #   accessible_testing_modules = TRUE,
    #   student_case_information = TRUE
    # WHERE role = 'Coordinator';

    # Commit changes and close the connection
    conn.commit()
    cursor.close()
    conn.close()
    print("Database updated successfully.")

except Exception as e:
    print("An error occurred:", e)
