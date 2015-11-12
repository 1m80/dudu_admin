# -*-coding:utf-8-*-

from flask import jsonify, make_response
from flask_restful import Resource, reqparse, fields, marshal

from app import api, app, auth, db
from app.models import Ebook, TopClassify, Classify

top_classify_fields = {
    'name': fields.String,
    'desc': fields.String,
    'lang': fields.Integer,
    'item_type': fields.Integer
}

class TopClassifyListView(Resource):
    decorators = [auth.login_required]

    def __init__(self):
        self.parser = reqparse.RequestParser()
        self.parser.add_argument('name', type=str, location='json')
        self.parser.add_argument('desc', type=str, location='json')
        self.parser.add_argument('lang', type=int, location='json')
        super(TopClassifyListView, self).__init__()

    def get(self, item_type):
        top_classifys = TopClassify.query.filter_by(item_type=item_type).all()
        return {'top_classifys': marshal(top_classifys, top_classify_fields)}


    def post(self, item_type):
        args = self.parser.parse_args()
        name = args['name']
        desc = args['desc']
        lang = args['lang']
        if name and lang and item_type:
            if not TopClassify.query.filter_by(name=name, lang=lang, item_type=item_type).first():
                top_classify = TopClassify(name=name, lang=lang, item_type=item_type, desc=desc)
                db.session.add(top_classify)
                db.session.commit()
                return {'top_classifys':marshal(top_classify, top_classify_fields)}, 201
            return make_response(jsonify({'message':u'该分类已存在'}), 422)
        return make_response(jsonify({'message':u'参数有误'}), 400)


api.add_resource(TopClassifyListView, '/api/topclassifys/item_type/<int:item_type>')
