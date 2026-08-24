import csv
import random

header = [
    'student_id', 'gender', 'ssc_percentage', 'hsc_percentage', 'degree_percentage', 'cgpa',
    'entrance_exam_score', 'technical_skill_score', 'soft_skill_score', 'internship_count',
    'live_projects', 'work_experience_months', 'certifications', 'attendance_percentage',
    'backlogs', 'extracurricular_activities', 'placement_status', 'salary_package_lpa'
]

with open('dataset/student_placement.csv', 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(header)
    for i in range(1, 5001):
        gender = random.choice(['Male', 'Female'])
        ssc = random.randint(50, 95)
        hsc = random.randint(50, 95)
        deg = random.randint(50, 95)
        cgpa = round(random.uniform(5.5, 9.8), 2)
        entrance = random.randint(40, 99)
        tech = random.randint(40, 99)
        soft = random.randint(40, 99)
        intern = random.randint(0, 5)
        proj = random.randint(0, 5)
        work = random.randint(0, 24)
        cert = random.randint(0, 5)
        att = random.randint(60, 99)
        back = random.randint(0, 5)
        extra = random.choice(['Yes', 'No'])
        
        # Simple logic for placement status
        score = cgpa * 10 + tech + soft + intern * 5 + cert * 5 - back * 5
        placed = 1 if score > 220 and back <= 2 else 0
        
        # Introduce some randomness to placement
        if random.random() < 0.1:
            placed = 1 - placed
            
        salary = 0.0
        if placed == 1:
            salary = round(random.uniform(3.0, 15.0), 2)
            
        writer.writerow([
            i, gender, ssc, hsc, deg, cgpa, entrance, tech, soft, intern,
            proj, work, cert, att, back, extra, placed, salary
        ])

print("Generated 5000 records successfully.")
