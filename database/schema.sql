-- ==========================================
-- DATABASE SCHEMA: SkillLens Placement System
-- ==========================================

CREATE DATABASE IF NOT EXISTS skilllens_db;
USE skilllens_db;

-- 1. Star Schema - Dimension Tables
CREATE TABLE Dim_Student (
    student_sk INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT UNIQUE NOT NULL,
    gender VARCHAR(10),
    extracurricular_activities VARCHAR(5)
);

CREATE TABLE Dim_Academic (
    academic_sk INT AUTO_INCREMENT PRIMARY KEY,
    ssc_percentage DECIMAL(5,2),
    hsc_percentage DECIMAL(5,2),
    degree_percentage DECIMAL(5,2),
    cgpa DECIMAL(4,2),
    backlogs INT
);

CREATE TABLE Dim_Skills (
    skill_sk INT AUTO_INCREMENT PRIMARY KEY,
    entrance_exam_score DECIMAL(5,2),
    technical_skill_score DECIMAL(5,2),
    soft_skill_score DECIMAL(5,2),
    certifications INT,
    attendance_percentage DECIMAL(5,2)
);

CREATE TABLE Dim_Experience (
    experience_sk INT AUTO_INCREMENT PRIMARY KEY,
    internship_count INT,
    live_projects INT,
    work_experience_months INT
);

-- 2. Star Schema - Fact Table
CREATE TABLE Fact_Placement (
    fact_id INT AUTO_INCREMENT PRIMARY KEY,
    student_sk INT,
    academic_sk INT,
    skill_sk INT,
    experience_sk INT,
    placement_status INT,
    salary_package_lpa DECIMAL(10,2),
    FOREIGN KEY (student_sk) REFERENCES Dim_Student(student_sk),
    FOREIGN KEY (academic_sk) REFERENCES Dim_Academic(academic_sk),
    FOREIGN KEY (skill_sk) REFERENCES Dim_Skills(skill_sk),
    FOREIGN KEY (experience_sk) REFERENCES Dim_Experience(experience_sk)
);

-- Note: In a real-world scenario, you would use an ETL tool or script 
-- to populate these dimensions and the fact table from your source system.
