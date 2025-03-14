import os
import pandas as pd
import psycopg2
from sqlalchemy import create_engine
from tqdm import tqdm  

#TODO: DO NOT UPLOAD CONNECTION STRING ONTO GITHUB
#TODO: DO NOT UPLOAD CONNECTION STRING ONTO GITHUB
#TODO: DO NOT UPLOAD CONNECTION STRING ONTO GITHUB
#TODO: DO NOT UPLOAD CONNECTION STRING ONTO GITHUB
#TODO: DO NOT UPLOAD CONNECTION STRING ONTO GITHUB
#TODO: DO NOT UPLOAD CONNECTION STRING ONTO GITHUB
#TODO: DO NOT UPLOAD CONNECTION STRING ONTO GITHUB
#TODO: DO NOT UPLOAD CONNECTION STRING ONTO GITHUB
DB_CONNECTION_STRING = "DO NOT UPLOAD CONNECTION STRING ONTO GITHUB"



engine = create_engine(DB_CONNECTION_STRING)

CSV_FOLDER = "/Users/unamazin/Documents/GitHub/aim-portal/data_generation/data/"  

csv_files = [f for f in os.listdir(CSV_FOLDER) if f.endswith(".csv")]

for csv_file in tqdm(csv_files, desc="Uploading CSV files"):
    file_path = os.path.join(CSV_FOLDER, csv_file)

    df = pd.read_csv(file_path)

    table_name = os.path.splitext(csv_file)[0]

    try:
        df.to_sql(table_name, engine, if_exists="replace", index=False)
        print(f"✅ Successfully uploaded: {csv_file} → Table: {table_name}")
        
    except Exception as e:
        print(f"❌ Error uploading {csv_file}: {e}")

engine.dispose()
print("🎉 All CSV files uploaded successfully!")
