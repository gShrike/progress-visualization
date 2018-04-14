import json

import numpy as np
from datetime import datetime, timedelta

def group_student_completed_assessments(progress, submission):
    date = submission['date']
    name = submission['studentName']
    assessment = submission['standardDescription']
    if not name or not assessment or not date.strip() or 'startDate' not in submission:
        progress['invalid_records'].append(submission)
        return
    date = datetime.strptime(date, '%m/%d/%Y %H:%M:%S')
    students = progress['students']
    if name not in students:
        start_date = datetime.strptime(submission['startDate'], '%Y-%m-%d')
        end_date = datetime.strptime(submission['endDate'], '%Y-%m-%d')
        students[name] = dict(start_date=start_date, end_date=end_date, assessments=dict())
    student = students[name]
    if submission['didPass'] == 'TRUE' and assessment not in student['assessments']:
        student['assessments'][assessment] = date

def group_student_assessment_into_intervals(students, total_intervals):
    for name in students:
        progress_intervals = [] 
        student = students[name]
        day_intervals = (student['end_date'] - student['start_date']).days / total_intervals 
        current_date = student['start_date']
        for _ in range(total_intervals):
            current_date = current_date + timedelta(days=day_intervals)
            if current_date >= datetime.now():
                break
            progress_intervals.append(dict(date=current_date, assessments=[]))
        for assessment in student['assessments']:
            assessment_date = student['assessments'][assessment]
            for interval in progress_intervals:
                if assessment_date <= interval['date']:
                    interval['assessments'].append(assessment)
        del student['assessments']
        student['progress'] = progress_intervals

def aggregate_student_intervals(students, total_intervals):
    intervals = []
    for i in range(total_intervals):
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

def parse_json(submissions_string, intervals):
    submissions = json.loads(submissions_string)
    progress = dict(students=dict(), invalid_records=[])
    for submission in submissions:
        group_student_completed_assessments(progress, submission)
    group_student_assessment_into_intervals(progress['students'], intervals)
    aggregate_student_intervals(progress['students'], intervals)
    return progress
