# -*-coding:utf-8-*-

from flask_wtf import Form
from wtforms import StringField
from wtforms_alchemy import model_form_factory

from app import db
from .models import User

BaseModelForm = model_form_factory(Form)

class ModelForm(BaseModelForm):
    @classmethod
    def get_session(self):
        return db.session

class UserCreateForm(ModelForm):
    class Meta:
        model = User

class SessionCreateForm(Form):
    username = StringField('username')
    password = StringField('password')
