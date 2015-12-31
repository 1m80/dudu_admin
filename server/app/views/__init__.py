# -*-coding:utf-8-*-

from flask import g, make_response, jsonify, request
from flask_restful import abort

from app import app, auth
from app.models import User

from . import user, ebook, data


@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization, Referer, Accept, Origin, User-Agent')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    response.headers.add('Access-Control-Max-Age','60')
    return response

@auth.verify_password
def verify_password(username_or_token, password):
    print username_or_token
    user = User.verify_auth_token(username_or_token)
    if not user:
        user = User.query.filter_by(username=username_or_token).first()
        if not user or user.verify_password(password):
            return False
    g.user = user
    return True

@auth.error_handler
def unauthorized():
    # return 403 instead of 401 to prevent browsers from displaying the default
    # auth dialog
    return make_response(jsonify({'message': 'Unauthorized access!!'}), 403)


