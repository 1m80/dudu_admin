# -*-coding:utf-8-*-

from flask import g, jsonify, make_response, request
from flask_restful import Resource, reqparse
import base64

from app import api, app, auth, db, flask_bcrypt
from app.models import User
from app.forms import UserCreateForm, SessionCreateForm

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
        user = User.query.filter_by(username=args['username']).first()
        if user and flask_bcrypt.check_password_hash(user.password, args['password']):
            token = user.generate_auth_token()
            return jsonify({'username':user.username, 'token':base64.b64encode(token+':x')})
        return '', 401

api.add_resource(UserView, '/api/users')
api.add_resource(SessionView, '/api/sessions')
