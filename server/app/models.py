# -*-coding:utf-8-*-
from datetime import datetime
from itsdangerous import (TimedJSONWebSignatureSerializer as Serializer, BadSignature, SignatureExpired)

from app import app, db, flask_bcrypt

class User(db.Model):
    __tablename__ = 'admin_users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(32), unique=True, nullable=False)
    password = db.Column(db.String(256), nullable=True)

    def __init__(self, username, password):
        self.username = username
        self.password = flask_bcrypt.generate_password_hash(password)

    def verify_password(self, password):
        return flask_bcrypt.check_password_hash(self.password, password)

    def generate_auth_token(self, expiration=21600):
        s = Serializer(app.config['SECRET_KEY'], expires_in=expiration)
        return s.dumps({'id': self.id})

    @staticmethod
    def verify_auth_token(token):
        s = Serializer(app.config['SECRET_KEY'])
        try:
            data = s.loads(token)
        except SignatureExpired:
            return None    # valid token, but expired
        except BadSignature:
            return None    # invalid token
        user = User.query.get(data['id'])
        return user

    def __repr__(self):
        return '<User %>' % self.username

class TopClassify(db.Model):
    __tablename__ = 'top_classify'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(64), nullable=False)
    desc = db.Column(db.Text)
    lang = db.Column(db.Integer, nullable=False) # 语种
    item_type = db.Column(db.Integer, nullable=False) # 类型，如电子书，有声读物，视频

class Classify(db.Model):
    __tablename__ = 'classify'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(64), nullable=False)
    desc = db.Column(db.Text)
    top_classify = db.Column(db.Integer, db.ForeignKey('top_classify.id'))

tags_common = db.Table('tags',
                       db.Column('tag_id', db.Integer, db.ForeignKey('tag.id')),
                       db.Column('common_id', db.Integer, db.ForeignKey('common.id'))
)

class Tag(db.Model):
    __tablename__ = 'tag'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(64), nullable=False)
    lang = db.Column(db.Integer, nullable=False)
    desc = db.Column(db.Text)

class Common(db.Model):
    __tablename__ = 'common'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    desc = db.Column(db.Text)
    lang = db.Column(db.Integer, nullable=False)
    title_plus = db.Column(db.String(120))
    desc_plus = db.Column(db.Text)
    top_classify = db.Column(db.Integer, db.ForeignKey('top_classify.id'))
    classify = db.Column(db.Integer, db.ForeignKey('classify.id'))
    tags = db.relationship('Tag', secondary=tags_common, backref=db.backref('common', lazy='dynamic'))
    upload_date = db.Column(db.DateTime, default=datetime.now())
    update_date = db.Column(db.DateTime)
    editor = db.Column(db.Integer, db.ForeignKey('admin_users.id'))
    brower = db.Column(db.Integer, nullable=False, default=0) # 浏览量

    is_sale = db.Column(db.Boolean, default=False) #是否上架

class Ebook(Common):
    __tablename__ = 'ebooks'

    id = db.Column(db.Integer, db.ForeignKey('common.id'), primary_key=True)
    author = db.Column(db.String(64))
    publisher = db.Column(db.String(64)) # 出版社
    pub_date = db.Column(db.String(64)) # 出版日期
    isbn = db.Column(db.String(32)) # ISBN
    orig_price = db.Column(db.Float,default=0) # 原价
    cur_price = db.Column(db.Float) # 现价
    discount = db.Column(db.Float) # 折扣
    sell = db.Column(db.Integer, nullable=False, default=0) # 销量
    cover = db.Column(db.String(120), nullable=False)
    pre_path = db.Column(db.String(120), nullable=False) # 预览地址
    download_path = db.Column(db.String(120), nullable=False) # 可下载文件地址


