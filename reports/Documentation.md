# SkillLens: Student Placement Intelligence System
## Final Year Data Warehousing and Data Mining (DWDM) Project

### 1. Problem Statement
Educational institutions often struggle to analyze large volumes of student data to predict placement outcomes effectively. Traditional systems lack predictive analytics and data mining techniques, leaving administrators and students without actionable insights regarding placement potential and skill gaps.

### 2. Objectives
- Build a robust **Data Warehouse** using a Star Schema for student academic and skill records.
- Implement an **ETL Pipeline** using Python to clean, transform, and load data.
- Utilize **Decision Tree Classification** to predict placement status and expected salary.
- Apply **K-Means Clustering** to segment students into High, Medium, and Low placement potential groups.
- Generate **Apriori Association Rules** to find patterns (e.g., High CGPA + Internships → Placed).
- Visualize insights using a professional **Power BI Dashboard** and a Web Application.

### 3. Modules
1. **Database & Data Warehouse Module:** MySQL relational schema and Star Schema creation.
2. **ETL Module:** Pandas-based extraction, missing value handling, and transformation.
3. **Machine Learning Module:** Scikit-learn integration for classification, clustering, and rule mining.
4. **Web Application Module:** Interactive dashboard for querying predictions, clusters, and reports.
5. **Reporting Module:** Power BI dashboard for KPIs and charts.

### 4. System Architecture
The system architecture follows a modern 3-tier structure:
1. **Data Layer:** MySQL Database housing the Star Schema (Fact and Dimension tables).
2. **Business/Processing Layer:** Python ETL scripts and Scikit-Learn ML models process the data. A backend server (Flask/Express) serves the predictions via REST APIs.
3. **Presentation Layer:** A responsive Web Dashboard (React/HTML/CSS/Bootstrap) and Power BI reports display the data.

### 5. Diagrams
- **ER Diagram:** Consists of normalized tables (`Student`, `Academic`, `Skills`).
- **Star Schema:** 
  - `Fact_Placement` (Center)
  - `Dim_Student`, `Dim_Academic`, `Dim_Skills`, `Dim_Experience` (Branches)
  
*(Note: Actual visual diagrams can be generated in UML tools like Draw.io using the schema provided in `database/schema.sql`)*

### 6. Results & Conclusion
- **Decision Tree Accuracy:** Successfully predicts placement status with high precision and recall based on the dataset metrics.
- **Clustering:** effectively segments students, allowing targeted training programs for 'Low Potential' students.
- **Association Rules:** Proved that practical experience (Internships) strongly correlates with successful placements.
- **Conclusion:** The SkillLens system successfully transitions raw academic data into actionable intelligence, bridging the gap between student preparation and industry requirements.

### 7. Future Scope
- Integration with live job portals for real-time skill matching.
- Deep Learning implementation for text analysis on resumes.
- Automated email alerts for students regarding their placement readiness.

