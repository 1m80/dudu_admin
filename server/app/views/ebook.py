# -*-coding:utf-8-*-

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
    def __init__(self):
        self.parser = reqparse.RequestParser()
        self.parser.add_argument('name', type=str, location='json')
        self.parser.add_argument('desc', type=str, location='json')
        self.parser.add_argument('lang', type=int, location='json')
        self.parser.add_argument('item_type', type=int, location='jon')
        super(TopClassifyListView, self).__init__()

    @auth.login_required
    def post(self):
        args = self.parser.parse_args()
        name = args['name']
        desc = args['desc']
        lang = args['lang']
        item_type = args['item_type']
        if name and lang and item_type:
            if not TopClassify.query.filter_by(name=name, lang=lang, item_type=item_type):
                top_classify = TopClassify(name=name, lang=lang, item_type=item_type, desc=desc)
                db.session.add(top_classify)
                db.session.commit()
                return {'top_classifys':marshal(top_classify, top_classify_fields)}, 201
            return '2', 401
        return '1', 401


api.add_resource(TopClassifyListView, '/api/topclassifys')
