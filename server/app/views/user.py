# -*-coding:utf-8-*-

from flask import g, jsonify
from flask_restful import Resource, reqparse

from app import api, app, auth, db, flask_bcrypt
from app.models import User
from app.forms import UserCreateForm, SessionCreateForm

@auth.verify_password
def verify_password(username_or_token, password):
    user = User.verify_auth_token(username_or_token)
    if not user:
        user = User.query.filter_by(username=username).first()
        if not user or user.verify_password(password):
            return False
    g.user = user
    return True

@app.route('/api/token')
@auth.login_required
def get_auth_token():
    token = g.user.generate_auth_token()
    return jsonify({'token': token.decode('ascii'), 'duration': 21600})

class UserView(Resource):
    def post(self):
        form = UserCreateForm()
        if not form.validate_on_submit():
            return form.errors, 422

        user = User(form.username.data, form.password.data)
        db.session.add(user)
        db.session.commit()
        return jsonify({'username':user.username})

class SessionView(Resource):
    def __init__(self):
        self.parser = reqparse.RequestParser()
        self.parser.add_argument('username', type=str, location='json')
        self.parser.add_argument('password', type=str, location='json')

    def post(self):
        args = self.parser.parse_args()
        print args['username']
        user = User.query.filter_by(username=args['username']).first()
        if user and flask_bcrypt.check_password_hash(user.password, args['password']):
            print user.generate_auth_token()
            return jsonify({'username':user.username, 'token': user.generate_auth_token()})
        return '', 401

api.add_resource(UserView, '/api/users')
api.add_resource(SessionView, '/api/sessions')
