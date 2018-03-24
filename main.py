import csv
from datetime import datetime, timedelta

STUDENT_PROGRESS_FILE = 'progress.csv'
PROGRAM_DAYS = 180
PROGRESS_INTERVALS = 5
TOTAL_INTERVALS = int(100/PROGRESS_INTERVALS)
DAY_INTERVALS = int(PROGRAM_DAYS/TOTAL_INTERVALS)

def group_student_completed_assessments(progress, row):
    date = row[0] 
    name = row[2]
    assessment = row[3]
    passed = row[9]
    if not name or not assessment or not date.strip():
        progress['invalid_records'].append(row)
        return
    date = datetime.strptime(date, '%m/%d/%Y %H:%M:%S')
    students = progress['students']
    if name not in progress['students']:
        students[name] = dict(start_date=date, end_date=date, assessments=dict())
    student = students[name]
    if passed and assessment not in student['assessments']:
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
        # TODO: find median and iqr per student

def aggregate_student_intervals(students):
    # TODO:
    # create interval array with dict
        # median, iqr, and completed_assessments
        # completed_assessments is an array
    # for each student
        # count number of completed assessments for each interval
        # push into correct interval completed_assessments 
    # for each interval
        # find median
        # calculate iqr
        # remove outliers
    pass

with open(STUDENT_PROGRESS_FILE) as csv_file:
    reader = csv.reader(csv_file, delimiter=',')
    next(reader, None)
    progress = dict(students=dict(), invalid_records=[], intervals=[])
    for row in reader:
        group_student_completed_assessments(progress, row)
    group_student_assessment_into_intervals(progress['students'])
    aggregate_student_intervals(progress['students'])
    # TODO: draw boxplot
