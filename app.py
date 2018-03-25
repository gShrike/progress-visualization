import os
from flask import Flask, render_template, request, json, url_for
from csv_parser import parse_csv
from boxplot import draw

STUDENT_PROGRESS_FILE = 'progress.csv'

port = int(os.environ.get('PORT', 5000))
app = Flask(__name__)

progress = parse_csv(STUDENT_PROGRESS_FILE)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/students')
def students():
    students = [*progress['students']]
    students.remove('intervals')
    students.sort()
    return app.response_class(
        response=json.dumps(students),
        status=200,
        mimetype='application/json'
    )

@app.route('/graph')
def graph():
    student = request.args.get('student')
    html = draw(progress['students'], student)
    return html

with app.test_request_context():
    url_for('static', filename='app.js')
    url_for('static', filename='style.css')
    url_for('static', filename='favicon.png')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=port, threaded=True)
