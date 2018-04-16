import os

from flask import Flask, render_template, request, json, url_for
from boxplot import draw

PORT = 5000

port = int(os.environ.get('PORT', PORT))
app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/graph', methods=['POST'])
def graph():
    student = request.args.get('student')
    body = request.get_json()

    return draw(body)

with app.test_request_context():
    url_for('static', filename='lz-string.js')
    url_for('static', filename='parser.js')
    url_for('static', filename='app.js')
    url_for('static', filename='style.css')
    url_for('static', filename='favicon.png')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=port, threaded=True)
