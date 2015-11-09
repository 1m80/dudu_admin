# -*-coding:utf-8-*_

from app import app, db
from app.models import User

user = User(username='dudu', password='qwertty')
db.session.add(user)
db.session.commit()
