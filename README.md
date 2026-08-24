# SkillLens: Student Placement Intelligence System
Final Year Data Warehousing and Data Mining (DWDM) Project.

This project includes a complete end-to-end implementation of a Student Placement Intelligence System.

## Live Application
The project includes a fully functional, containerized, interactive dashboard built with React (TypeScript) and Express.js to demonstrate the exact ML algorithms requested (Decision Tree, K-Means, Apriori) running natively in the browser. 

You can interact with the app via the live preview to the right. It includes:
- KPI Dashboard
- Searchable Student Records
- ML Placement Prediction Tool
- K-Means Cluster Analysis
- Apriori Association Rules

## Project Structure & Deliverables
In the file tree on the left, you will find all the required artifacts for your university submission:

- `database/schema.sql`: Contains the complete MySQL relational schema and the **Star Schema** (Fact and Dimension tables).
- `etl/etl_pipeline.py`: Contains the **Python (Pandas)** ETL script to extract, transform (handle missing values, duplicates, encode), and load data.
- `machine_learning/models.py`: Contains the **Scikit-learn** Python code for Decision Trees, K-Means Clustering, and Apriori Rule Mining.
- `backend/app.py`: Contains the **Python (Flask)** API backend code structure.
- `powerbi/README.md`: Contains instructions for setting up the professional Dark Theme Power BI Dashboard.
- `reports/Documentation.md`: Contains the complete written project documentation (Problem Statement, Architecture, Methodology, etc.).

## How to use for your submission
1. Download this workspace.
2. The `src/` folder contains the live, interactive frontend and backend that you can showcase.
3. The other folders (`database`, `etl`, `machine_learning`, `backend`) contain the specific technological stack implementations you requested for your documentation and code submission.
