# -*-coding:utf-8-*-

from flask import jsonify, make_response, request
from flask_restful import Resource, reqparse, fields, marshal
from flask_json import as_json_p

from app import api, app, auth, db
from app.models import Ebook, TopClassify, Classify

top_classify_fields = {
    'name': fields.String,
    'desc': fields.String,
    'lang': fields.Integer,
    'item_type': fields.Integer,
    'id': fields.Integer
}

class TopClassifyListView(Resource):

    def __init__(self):
        self.parser = reqparse.RequestParser()
        self.parser.add_argument('name', type=unicode, location='json')
        self.parser.add_argument('desc', type=unicode, location='json')
        self.parser.add_argument('lang', type=int, location='json')
        self.parser.add_argument('callback', type=str, location='args')
        super(TopClassifyListView, self).__init__()

    @as_json_p
    def get(self, item_type):
        args = self.parser.parse_args()
        callback = args['callback']
        top_classifys = TopClassify.query.filter_by(item_type=item_type).all()
        return {'top_classifys':marshal(top_classifys, top_classify_fields)}


    @auth.login_required
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

classify_fields = {
    'id': fields.Integer,
    'name':fields.String,
    'desc': fields.String,
    'top_classify':fields.Integer
}

class ClassifyListView(Resource):
    def __init__(self):
        self.parser = reqparse.RequestParser()
        self.parser.add_argument('name', type=unicode, location='json')
        self.parser.add_argument('desc', type=unicode, location='json')
        self.parser.add_argument('top_classify', type=int,location='json')
        super(ClassifyListView,self).__init__()

    @auth.login_required
    def post(self, item_type):
        args = self.parser.parse_args()
        name = args['name']
        desc = args['desc']
        top_classify = args['top_classify']
        if name and top_classify:
            if not Classify.query.filter_by(name=name, top_classify=top_classify).first():
                classify = Classify(name=name, desc=desc, top_classify=top_classify)
                db.session.add(classify)
                db.session.commit()
                return make_response(jsonify({'message': 'add success'}), 201)
            return make__response(jsonify({'message':'the classify exists already!'}), 422)
        return make_response(jsonify({'message': 'wrong params'}), 400)

api.add_resource(TopClassifyListView, '/api/top_classifys/item_type/<int:item_type>')
api.add_resource(ClassifyListView, '/api/classifys/item_type/<int:item_type>')
