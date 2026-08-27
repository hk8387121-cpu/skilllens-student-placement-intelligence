import pandas as pd
import mysql.connector
from sqlalchemy import create_engine
import os

def run_etl():
    print("Starting ETL Process (Python)...")
    
    # 1. Extract
    print("Extracting data from CSV...")
    df = pd.read_csv('../dataset/student_placement.csv')
    
    # 2. Transform
    print("Transforming data...")
    # Remove duplicates
    df = df.drop_duplicates()
    
    # Handle missing values
    numeric_cols = df.select_dtypes(include=['number']).columns
    df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].mean())
    
    categorical_cols = df.select_dtypes(include=['object']).columns
    df[categorical_cols] = df[categorical_cols].fillna(df[categorical_cols].mode().iloc[0])
    
    # Clean up strings
    df['gender'] = df['gender'].str.strip().str.title()
    df['extracurricular_activities'] = df['extracurricular_activities'].str.strip().str.title()
    df['placement_status'] = df['placement_status'].astype(int)
    
    # 3. Load (Mock connecting to a MySQL DB with Star Schema)
    print("Data cleaned. Ready to be loaded into MySQL Star Schema.")
    print(f"Total processed records: {len(df)}")
    # In a real environment:
    # engine = create_engine('mysql+mysqlconnector://user:pass@localhost/skilllens_db')
    # df_student.to_sql('Dim_Student', engine, if_exists='append', index=False)
    # df_academic.to_sql('Dim_Academic', engine, if_exists='append', index=False)
    # ...
    
    print("ETL Process Completed Successfully.")

if __name__ == "__main__":
    run_etl()
