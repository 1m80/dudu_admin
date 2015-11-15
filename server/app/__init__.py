# -*-coding:utf-8-*-

from flask import Flask
from flask_bcrypt import Bcrypt
from flask_httpauth import HTTPBasicAuth
from flask_restful import Api
from flask_sqlalchemy import SQLAlchemy
from flask_json import FlaskJSON

from config import config

config_name = 'default'


app = Flask(__name__)
app.config.from_object(config[config_name])

db = SQLAlchemy(app)
api = Api(app)
flask_bcrypt = Bcrypt(app)
auth = HTTPBasicAuth()
json = FlaskJSON(app)

import views
import models
