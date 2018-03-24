from csv_parser import parse_csv
from boxplot import draw

STUDENT_PROGRESS_FILE = 'progress.csv'

progress = parse_csv(STUDENT_PROGRESS_FILE)
students = [*progress['students']]
sample_student = 'Malcolm Foster'
draw(progress['students'], sample_student)
