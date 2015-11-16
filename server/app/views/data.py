# -*-coding:utf-8-*-

from flask import jsonify, make_response
from flask_restful import Resource, reqparse, fields, marshal
from flask_json import as_json_p

from app import api, app, auth, db
from app.models import Tag

tag_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'lang': fields.Integer,
    'desc': fields.String
}

class TagListView(Resource):
    def __init__(self):
        self.parser = reqparse.RequestParser()
        self.parser.add_argument('name', type=unicode, location='json')
        self.parser.add_argument('lang', type=int, location='json')
        self.parser.add_argument('desc', type=unicode, location='json')

    def get(self):
        pass

    @auth.login_required
    def post(self, lang_type):
        args = self.parser.parse_args()
        name = args['name']
        desc = args['desc']
        lang = args['lang']
        if name and lang:
            if not Tag.query.fitler_by(name=name, lang=lang).first():
                tag = Tag(name=name, lang=lang, desc=desc)
                db.session.add(tag)
                db.sessoin.commit()
                return {'tags': marsha(tag, tag_fields)}, 20

            return make_response(jsonify({'message':u'该标签已存在'}), 422)
        return make_response(jsonify({'message':u'参数有误'}), 400)


api.add_resource(TagListView, '/tags/lang_type/<int:lang_type>')
