import json

import numpy as np
from datetime import datetime, timedelta

from constants import TOTAL_INTERVALS, DAY_INTERVALS

def group_student_completed_assessments(progress, row):
    date = row['date']
    name = row['studentName']
    assessment = row['standardDescription']
    passed = row['didPass']
    if not name or not assessment or not date.strip():
        progress['invalid_records'].append(row)
        return
    date = datetime.strptime(date, '%m/%d/%Y %H:%M:%S')
    students = progress['students']
    if name not in students:
        students[name] = dict(start_date=date, end_date=date, assessments=dict())
    student = students[name]
    if passed == 'TRUE' and assessment not in student['assessments']:
        student['assessments'][assessment] = date
    if student['end_date'] < date:
        student['end_date'] = date

def group_student_assessment_into_intervals(students):
    for name in students:
        progress_intervals = [] 
        student = students[name]
        date = student['start_date']
        for i in range(TOTAL_INTERVALS):
            progress_intervals.append(dict(date=date, assessments=[]))
            date = date + timedelta(days=DAY_INTERVALS)
            if date > student['end_date']:
                break
        for assessment in student['assessments']:
            assessment_date = student['assessments'][assessment]
            for interval in progress_intervals:
                if assessment_date <= interval['date']:
                    interval['assessments'].append(assessment)
        del student['assessments']
        student['progress'] = progress_intervals

def aggregate_student_intervals(students):
    intervals = []
    for i in range(TOTAL_INTERVALS):
       interval = dict(median=0, iqr=0, q1=0, q3=0, min=0, max=0, completed_assessments=[]) 
       intervals.append(interval)
    for name in students:
        student = students[name]
        for index, progress in enumerate(student['progress']):
            intervals[index]['completed_assessments'].append(len(progress['assessments'])) 
    for interval in intervals:
        assessments = interval['completed_assessments']
        if len(assessments) is not 0:
            interval['median'] = np.median(assessments)
            q3, q1 = np.percentile(assessments, [75 ,25])
            interval['q3'] = q3
            interval['q1'] = q1
            interval['iqr'] = q3 - q1
            interval['min'] = np.amin(assessments)
            interval['max'] = np.amax(assessments)
    students['intervals'] = intervals

def parse_json(data):
    reader = json.loads(data.decode())
    progress = dict(students=dict(), invalid_records=[])
    for row in reader[1:]:
        group_student_completed_assessments(progress, row)
    group_student_assessment_into_intervals(progress['students'])
    aggregate_student_intervals(progress['students'])
    return progress
