import os

from flask import Flask, render_template, request, json, url_for
from boxplot import draw

from submissions_parser import parse_json

PORT = 5000
DISPLAY_PERCENTAGE = 100

port = int(os.environ.get('PORT', PORT))
app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/graph', methods=['POST'])
def graph():
    progress_intervals = 5 
    student = request.args.get('student')
    body = request.get_json()

    if body['endDate'] != 'FALSE':
        progress_intervals = 2 
    total_intervals = int(DISPLAY_PERCENTAGE/progress_intervals)

    progress = parse_json(body['submissions'], total_intervals)
    return draw(progress['students'], student, body['endDate'], total_intervals)

with app.test_request_context():
    url_for('static', filename='lz-string.js')
    url_for('static', filename='app.js')
    url_for('static', filename='style.css')
    url_for('static', filename='favicon.png')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=port, threaded=True)
