# Power BI Dashboard Setup Instructions

To create the professional dark theme dashboard requested for this project:

### 1. Data Import
1. Open Power BI Desktop.
2. Click **Get Data** > **Text/CSV**.
3. Select the `dataset/student_placement.csv` file from this project.
4. Click **Load**.

### 2. Theme Setup
1. Go to the **View** tab.
2. Click the dropdown in the **Themes** section.
3. Select **Innovate** or **Frontier** (or browse for a custom dark theme) to set a dark background and vibrant chart colors.

### 3. Create KPI Cards
Add 'Card' visuals for the following:
- **Total Students:** Count of `student_id`.
- **Total Placed Students:** Count of `placement_status` where value = 1.
- **Placement Percentage:** (Total Placed / Total Students) * 100 (Create a DAX Measure).
- **Average Salary:** Average of `salary_package_lpa` (Filter to exclude 0.0 values).
- **Highest Salary:** Max of `salary_package_lpa`.

### 4. Create Charts
- **Placement Status:** Donut Chart (Legend: `placement_status`).
- **Placement by Gender:** Clustered Bar Chart (Axis: `gender`, Legend: `placement_status`, Values: Count of `student_id`).
- **Average Salary by Gender:** Column Chart (Axis: `gender`, Values: Avg `salary_package_lpa`).
- **CGPA Distribution:** Histogram/Column Chart (Axis: `cgpa` binned, Values: Count of `student_id`).
- **Skills vs Placement:** Scatter Plot (X: `technical_skill_score`, Y: `soft_skill_score`, Legend: `placement_status`).

### 5. Add Slicers
Add 'Slicer' visuals to the left side of your dashboard for:
- Gender
- Placement Status
- CGPA (Slider)
- Internship Count
- Certifications

### 6. Export
Save the `.pbix` file in this `powerbi/` directory for submission.
