# -*-coding:utf-8-*-

from flask import jsonify, make_response, request
from flask_restful import Resource, reqparse, fields, marshal
from flask_json import as_json_p, json_response
import json
import werkzeug
from werkzeug import secure_filename

from app import api, app, auth, db
from app.models import Tag, TopClassify, Classify, Common
from app.utils import img_upload
from app.utils.cross_domain import allow_cross_domain

tag_fields = {
    'id': fields.Integer,
    'title': fields.String,
    'lang': fields.Integer,
    'desc': fields.String
}

class TagListView(Resource):
    def __init__(self):
        self.parser = reqparse.RequestParser()
        self.parser.add_argument('title', type=unicode, location='json')
        self.parser.add_argument('lang', type=int, location='json')
        self.parser.add_argument('desc', type=unicode, location='json')
        self.parser.add_argument('callback', type=str, location='args')
        super(TagListView, self).__init__()

    @as_json_p
    def get(self, lang_type):
        args = self.parser.parse_args()
        callback = args['callback']
        tags = Tag.query.all()
        return {'tags': marshal(tags, tag_fields)}

    @auth.login_required
    def post(self, lang_type):
        args = self.parser.parse_args()
        title = args['title']
        desc = args['desc']
        lang = args['lang']
        if title and lang:
            if not Tag.query.filter_by(title=title, lang=lang).first():
                tag = Tag(title=title, lang=lang, desc=desc)
                db.session.add(tag)
                db.session.commit()
                return {'tags': marshal(tag, tag_fields)}, 201

            return make_response(jsonify({'message':u'该标签已存在'}), 422)
        return make_response(jsonify({'message':u'参数有误'}), 400)




top_classify_fields = {
    'title': fields.String,
    'desc': fields.String,
    'lang': fields.Integer,
    'item_type': fields.Integer,
    'id': fields.Integer
}

class TopClassifyListView(Resource):

    def __init__(self):
        self.parser = reqparse.RequestParser()
        self.parser.add_argument('title', type=unicode, location='json')
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
        title = args['title']
        desc = args['desc']
        lang = args['lang']
        if title and lang and item_type:
            if not TopClassify.query.filter_by(title=title, lang=lang, item_type=item_type).first():
                top_classify = TopClassify(title=title, lang=lang, item_type=item_type, desc=desc)
                db.session.add(top_classify)
                db.session.commit()
                return {'top_classifys':marshal(top_classify, top_classify_fields)}, 201
            return make_response(jsonify({'message':u'该分类已存在'}), 422)
        return make_response(jsonify({'message':u'参数有误'}), 400)

classify_fields = {
    'id': fields.Integer,
    'title':fields.String,
    'desc': fields.String,
    'top_classify':fields.Integer
}

class ClassifyListView(Resource):
    def __init__(self):
        self.parser = reqparse.RequestParser()
        self.parser.add_argument('title', type=unicode, location='json')
        self.parser.add_argument('desc', type=unicode, location='json')
        self.parser.add_argument('top_classify', type=int,location='json')
        self.parser.add_argument('callback', type=str, location='args')
        super(ClassifyListView,self).__init__()

    @as_json_p
    def get(self, item_type):
        args = self.parser.parse_args()
        callback = args['callback']
        top_classifys = []
        classifys = []
        for tc, c in db.session.query(TopClassify, Classify).filter(TopClassify.id==Classify.top_classify).filter(TopClassify.item_type==item_type).all():
            #tc_json = json.dumps(marshal(tc, top_classify_fields))
            #c_json = json.dumps(marshal(c, classify_fields))
            #classifys.append({'top_classify':tc_json, 'classify':c_json})
            top_classifys.append(marshal(tc, top_classify_fields))
            classifys.append(marshal(c, classify_fields))

        return json_response(top_classifys=top_classifys, classifys=classifys)


    @auth.login_required
    def post(self, item_type):
        args = self.parser.parse_args()
        title = args['title']
        desc = args['desc']
        top_classify = args['top_classify']
        if title and top_classify:
            if not Classify.query.filter_by(title=title, top_classify=top_classify).first():
                classify = Classify(title=title, desc=desc, top_classify=top_classify)
                db.session.add(classify)
                db.session.commit()
                return make_response(jsonify({'message': 'add success'}), 201)
            return make__response(jsonify({'message':'the classify exists already!'}), 422)
        return make_response(jsonify({'message': 'wrong params'}), 400)



class UploadCoverView(Resource):
    def __init__(self):
        self.parser = reqparse.RequestParser()
        self.parser.add_argument('item_id', type=int, location='form')
        super(UploadCoverView, self).__init__()

    @auth.login_required
    def post(self, item_id):
        args = self.parser.parse_args()

        cover = request.files['file']

        if cover and img_upload.allowed_file(cover.filename):
            cover_path = img_upload.upload_cover(cover)
            common = Common.query.get(item_id)
            common.cover = cover_path
            db.session.commit()
            return make_response(jsonify({'message':u'上传成功'}), 200)
        return make_response(jsonify({'message':u'上传文件格式不正确'}), 400)

class UploadPreView(Resource):
    def __init__(self):
        self.parser = reqparse.RequestParser()
        self.parser.add_argument('item_id', type=int, location='form')
        self.parser.add_argument('pre_path', type=str, location='json')
        super(UploadPreView, self).__init__()

    def post(self):
        args = self.parser.parse_args()

        pre_path = args['pre_path']
        if pre_path:
            print pre_path
        else:
            print 'no pre_path'

        
        


api.add_resource(TagListView, '/api/tags/lang_type/<int:lang_type>')
api.add_resource(TopClassifyListView, '/api/top_classifys/item_type/<int:item_type>')
api.add_resource(ClassifyListView, '/api/classifys/item_type/<int:item_type>')
api.add_resource(UploadCoverView, '/api/upload/cover/<int:item_id>')
api.add_resource(UploadPreView, '/api/upload/preview')
