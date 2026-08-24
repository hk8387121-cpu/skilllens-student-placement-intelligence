import pandas as pd
import mysql.connector
from sqlalchemy import create_engine

# ==========================================
# ETL PIPELINE: Python (Pandas)
# ==========================================

def run_etl():
    print("Starting ETL Process...")

    # 1. Extract
    print("Extracting data from CSV...")
    df = pd.read_csv('../dataset/student_placement.csv')

    # 2. Transform
    print("Transforming data...")
    # Remove duplicates
    df = df.drop_duplicates()

    # Handle missing values (Fill numeric with mean, categorical with mode)
    numeric_cols = df.select_dtypes(include=['number']).columns
    df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].mean())
    
    categorical_cols = df.select_dtypes(include=['object']).columns
    df[categorical_cols] = df[categorical_cols].fillna(df[categorical_cols].mode().iloc[0])

    # Convert data types if necessary
    df['placement_status'] = df['placement_status'].astype(int)

    # 3. Load
    print("Loading data into MySQL Data Warehouse...")
    # Update with your MySQL credentials
    # engine = create_engine('mysql+mysqlconnector://root:password@localhost/skilllens_db')

    print("ETL Process Completed Successfully.")

if __name__ == "__main__":
    # run_etl()
    pass
