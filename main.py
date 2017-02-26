import sqlite3, ipdb, json, random
import numpy as np
from flask import g, Flask, render_template, send_from_directory, request
from database import query_db, insert
from settings import Settings
from helpers import parseJSTimeStamp, intToArray, arrayToInt

# init
ex_settings = Settings()
app = Flask(__name__, static_url_path='')

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

# resources
@app.route('/img/<path:path>')
def send_img(path):
    return send_from_directory('img', path)

@app.route('/js/<path:path>')
def send_js(path):
    return send_from_directory('js', path)

@app.route('/css/<path:path>')
def send_css(path):
    return send_from_directory('css', path)

@app.route('/sound/<path:path>')
def send_sound(path):
    return send_from_directory('sound', path)

# json
@app.route('/getSettings')
def giveSettings():
    return json.dumps(dict(ex_settings))

@app.route('/bulbs/<nickname>/getConfig')
def giveConfig(nickname):
    # TODO query the database
    possib = set(range(1, 1024))
    rows = query_db("SELECT config FROM results WHERE nick = \"" + nickname + "\"")
    used = set([int(row['config']) for row in rows])
    possib = possib.difference(used)
    print(used)
    config = intToArray(random.sample(possib, 1)[0])
    for _ in range(10):
        config.append(random.random() > .5)
    return json.dumps(config)

# getting data from the front
@app.route('/bulbs/<nickname>/submit', methods=['POST'])
def submit(nickname):
    start = parseJSTimeStamp(int(request.form['start']))
    end = parseJSTimeStamp(int(request.form['end']))
    config = arrayToInt(json.loads(request.form['config']))
    results = json.loads(request.form['results'])
    # TODO insert into the database
    values = [nickname, start, end, config] + results
    insert("results", values=values)
    return ""

# views
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/settings')
def settings():
    return render_template('settings.html')

@app.route('/bulbs/<nickname>')
def bulbs(nickname):
    return render_template('bulbs.html', nick=nickname)

# post
@app.route('/', methods=['POST'])
def get_settings():
    timeout = int(request.form.get('timeout', ex_settings.timeout))
    mode = request.form.get('mode', ex_settings.mode)
    fb = request.form.get('feedback', ex_settings.feedback)
    if fb == 'True':
        fb = True
    ex_settings.setTimeout(timeout).setMode(mode).setFeedback(fb)
    return render_template('index.html')

app.run()
