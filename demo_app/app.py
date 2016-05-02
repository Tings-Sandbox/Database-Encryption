from __future__ import print_function

from flask import Flask, render_template, request, make_response, url_for, redirect
app = Flask(__name__)

try:
    import load_passwords
except ImportError:
    import load_passwords_stub as load_passwords

PASSWORD_DATABASE = '/etc/youber_passwords.db'


@app.route('/record_analytics', methods=['POST'])
def record_analytics():
    body = request.get_json(True)
    if 'callback' in body:
        eval(body['callback'])(body)
    return '', 204


@app.route('/show')
def show_items():
    password = request.cookies.get('password', None) or request.args.get('password', '')
    try:
        db = load_passwords.read_database(PASSWORD_DATABASE, password)
    except Exception:
        resp = make_response(render_template('bad_password.html'), 401)
        resp.set_cookie('password', '', expires=0)
        return resp
    resp = make_response(render_template('show.html', db=db))
    resp.set_cookie('password', password)
    return resp


@app.route('/logout')
def logout():
    resp = make_response(render_template('logout.html'))
    resp.set_cookie('password', '', expires=0)
    return resp


@app.route('/')
def root():
    if request.cookies.get('password'):
        return redirect(url_for('show_items'))
    else:
        return render_template('root.html')


if __name__ == '__main__':
    # Doesn't work for some reason unless you run as root, so remember to sudo
    app.run(host='0.0.0.0', port=80)
