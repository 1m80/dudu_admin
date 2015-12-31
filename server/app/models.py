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
    tags = db.relationship('Tag', enable_typechecks=False, secondary=tags_common, backref=db.backref('common', lazy='dynamic'))
    upload_date = db.Column(db.DateTime, default=datetime.now())
    update_date = db.Column(db.DateTime)
    editor = db.Column(db.Integer, db.ForeignKey('admin_users.id'))
    browser = db.Column(db.Integer, nullable=False, default=0) # 浏览量
    item_type = db.Column(db.Integer) #类型, 1为电子书,2为有声读物,  3为视频, 4为音频, 5为图片

    cover = db.Column(db.String(120)) #封面
    is_sale = db.Column(db.Boolean, default=False) #是否上架

    def _find_tag(self, tag_id):
        t = Tag.query.filter_by(id=tag_id).first()
        return t

    def _get_tags(self):
        return [x. name for x in self.tags]

    def _set_tags(self, tag_ids):
        # clear the list first
        while self.tags:
            del self.tags[0]
        # add new tags:
        for tag_id in tag_ids:
            cur_tag = self._find_tag(tag_id)
            self.tags.append(self._find_tag(tag_id))

    str_tags = property(_get_tags, _set_tags, 'Property str_tags is a simple wrapper for tags relations')



class Ebook(db.Model):
    __tablename__ = 'ebooks'

    id = db.Column(db.Integer, db.ForeignKey('common.id'), primary_key=True)
    author = db.Column(db.String(64))
    publisher = db.Column(db.String(64)) # 出版社
    pub_date = db.Column(db.String(64)) # 出版日期
    isbn = db.Column(db.String(32)) # ISBN
    orig_price = db.Column(db.Float,default=0) # 原价
    cur_price = db.Column(db.Float) # 现价
    sell = db.Column(db.Integer, nullable=False, default=0) # 销量
    pre_path = db.Column(db.String(120)) # 预览地址
    download_path = db.Column(db.String(120)) # 可下载文件地址


