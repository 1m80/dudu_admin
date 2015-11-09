# -*-coding:utf-8-*-

from flask import g, jsonify
from flask_restful import Resource

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
    def post(self):
        form = SessionCreateForm()
        if not form.validate_on_submit():
            return form.errors, 422
        user = User.query.filter_by(username=form.username.data).first()
        if user and flask_bcrypt.check_password_hash(user.password, form.password.data):
            return jsonify({'username':user.username})
        return '', 401

api.add_resource(UserView, '/api/users')
api.add_resource(SessionView, '/api/sessions')
