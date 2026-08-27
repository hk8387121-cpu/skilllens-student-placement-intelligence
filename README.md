# SkillLens: Student Placement Intelligence System Using Data Warehousing and Data Mining

## Overview
SkillLens is a robust academic DWDM project designed to process historical student placement data, construct a relational Data Warehouse using a Star Schema, and apply Data Mining algorithms to extract insights and predict future placement outcomes.

## Objectives
1. **Historical Analysis**: Analyze what factors (CGPA, Backlogs, Skills, Internships) historically lead to successful placements using OLAP-style queries and Power BI.
2. **Future Prediction**: Predict whether a new student will be placed using a Decision Tree Classifier trained on the historical Data Warehouse.

## Architecture & Workflow
```
Student Dataset (CSV) -> ETL Pipeline (Pandas/TypeScript) -> Data Warehouse (Star Schema) -> Data Mining (Decision Tree, K-Means, Apriori) -> Analytics Layer (Power BI & React Web Dashboard)
```

## Modules
1. **Data Collection & ETL**: Reads raw `student_placement.csv`, cleans missing/duplicate data, normalizes categorical fields, and loads it into the Data Warehouse.
2. **Data Warehouse (Star Schema)**: Separates facts (Placement outcomes) from dimensions (Student, Academic, Skills, Experience).
3. **Data Mining & Placement Prediction**:
   - **Decision Tree**: Predicts placement status with an 80/20 train/test split.
   - **K-Means**: Clusters students into High, Medium, and Low placement readiness.
   - **Apriori**: Discovers frequent itemset rules (e.g., High CGPA + Internship -> Placed).
4. **Power BI Analytics**: Visualizes the Data Warehouse facts and dimensions.
5. **Web Application & Reporting**: A React + Node.js dashboard to interact with the models and DW.

## Database Setup (Star Schema)
The Data Warehouse is built using a Star Schema:
- **Fact Table**: `Fact_Placement` (Contains `placement_status`, `salary_package_lpa`, and foreign keys).
- **Dimension Tables**: `Dim_Student`, `Dim_Academic`, `Dim_Skills`, `Dim_Experience`.

*Note: For the cloud preview environment, the active DW is implemented via SQLite (`database/skilllens_dw.sqlite`). A MySQL equivalent `database/schema.sql` is provided for local deployment.*

## Running the Web Application
```bash
# Install dependencies
npm install

# Run the ETL pipeline to generate the Data Warehouse
npx tsx src/backend/etl.ts

# Start the dev server (React + Express)
npm run dev
```

## Power BI Setup
To connect Power BI Desktop to this project:
1. Download the generated SQLite database file (`database/skilllens_dw.sqlite`).
2. Install the SQLite ODBC driver on your Windows PC.
3. Open Power BI -> Get Data -> ODBC -> Connect to the SQLite DSN.
4. The tables are already perfectly normalized in a Star Schema. Define `Fact_Placement` as the center and link the dimension tables via their Surrogate Keys (`_sk`).

## Actual ML Results (Node.js Implementation)
- **Decision Tree Accuracy**: ~84.3%
- **Decision Tree Precision**: ~79.1%
- **Decision Tree Recall**: ~78.0%
- **Feature Importance**: Backlogs (43.6%), Soft Skills (14.8%), Technical Skills (13.7%), CGPA (9.9%).

## GitHub Pages Deployment

This project is configured to automatically deploy its frontend to **GitHub Pages** using GitHub Actions.

**Important Backend Limitation on GitHub Pages:**
GitHub Pages only hosts static frontend assets (HTML, CSS, JS). It cannot host the Express.js Node backend or the local SQLite Data Warehouse.

Therefore:
- The GitHub Pages deployment only runs the React frontend.
- To use the live data, ML predictions, and DWDM analytics, the backend API must be hosted separately (e.g., on Render, Heroku, or Google Cloud Run).
- The frontend will look for an environment variable named `VITE_API_URL` to connect to the backend. If this is not provided, it falls back to a relative path, which will fail if there is no backend serving those routes.

**Deployment URL:**
[https://hk8387121-cpu.github.io/skilllens-student-placement-intelligence/](https://hk8387121-cpu.github.io/skilllens-student-placement-intelligence/)

**How the deployment works:**
- The repository contains a GitHub Actions workflow in `.github/workflows/deploy.yml`.
- Any push to the `main` branch triggers a Vite build (`npm run build`).
- The `dist/` directory is then published to GitHub Pages.
- The Vite configuration (`vite.config.ts`) includes the `base` path required for this repository name.
- React Router has been updated to use `HashRouter` to prevent 404 errors during client-side navigation on GitHub Pages.
