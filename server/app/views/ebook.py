# -*-coding:utf-8-*-

from flask import jsonify, make_response, request
from flask_restful import Resource, reqparse, fields, marshal
from flask_json import as_json_p

from app import api, app, auth, db
from app.models import Ebook, TopClassify, Classify

ebook_fields = {
    'id': fields.Integer,
    'title': fields.String,
    'desc': fields.String,
    'lang': fields.Integer,
    'title_plus': fields.String,
    'desc_plus': fields.String,
    'top_classify': fields.Integer,
    'classify': fields.Integer,
    'tag': fields.List,
    'upload_date': fields.DateTime,
    'update_date': fields.DateTime,
    # 'editor': fields.Nested(user_fileds),
    'browser': fields.Integer,
    'author': fields.String,
    'publisher': fields.String,
    'pub_date': fields.DateTime,
    'isbn': fields.String,
    'orig_price': fields.Float,
    'cur_price': fields.Float,
    'sell': fields.Integer,
    'cover': fields.String,
    'pre_path': fields.String,
    'download_path': fields.String
}

class EbookListView(Resource):
    def __init__(self):
        self.parser = reqparse.RequestParser()
        self.parser.add_argument('title', type=unicode, location='json', required=True)
        self.parser.add_argument('desc', type=unicode, location='json')
        self.parser.add_argument('lang', type=int, location='json', required=True)
        self.parser.add_argument('title_plus', type=unicode, location='json')
        self.parser.add_argument('desc_plus', type=unicode, location='json')
        self.parser.add_argument('top_classify', type=int, location='json', required=True)
        self.parser.add_argument('classify', type=int, location='json', required=True)
        self.parser.add_argument('tags', type=list, location='json')
        self.parser.add_argument('editor', type=int, location='json', required=True)
        self.parser.add_argument('is_sale', type=bool, location='json')
        self.parser.add_argument('author', type=unicode, location='json', required=True)
        self.parser.add_argument('publisher', type=unicode, location='json')
        self.parser.add_argument('pub_date', type=int, location='json')
        self.parser.add_argument('isbn', type=str, location='json')
        self.parser.add_argument('orig_price', type=float, location='json')
        self.parser.add_argument('cur_price', type=float, location='json', required=True)
        super(EbookListView, self).__init__()


    def post(self):
       args = self.parser.parse_args()
       title = args['title']
       desc = args['desc']
       lang = args['lang']
       title_plus = args['title_plus']
       author = args['author']
       classify = args['classify']
       cur_price = args['cur_price']
       desc_plus = args['desc']
       editor = args['editor']
       is_sale = args['is_sale']
       isbn = args['isbn']
       pub_date = args['pub_date']
       publisher = args['publisher']
       tags = args['tags']
       top_classify = args['top_classify']
       orig_price = args['orig_price']

       if title and lang and top_classify and classify and author:
           if  not Ebook.query.filter_by(title=title, lang=lang, top_classify=top_classify, classify=classify, author=author).first():
               ebook = Ebook(
                   title=title,
                   desc=desc,
                   lang=lang,
                   title_plus=title_plus,
                   desc_plus=desc_plus,
                   top_classify=top_classify,
                   classify=classify, editor=editor,
                   browser=0,
                   is_sale=is_sale,
                   author=author,
                   publisher=publisher,
                   pub_date=pub_date,
                   isbn=isbn,
                   orig_price=orig_price,
                   cur_price=cur_price,
                   sell=0)
               db.session.add(ebook)
               db.session.commit()
               ebook.str_tags = tags
               db.session.commit()
               return make_response(jsonify({'message': 'add success!'}), 201)

           return make_response(jsonify({'message': 'the book exists already!'}), 404)

       return make_response(jsonify({'message': 'wrong params'}))



api.add_resource(EbookListView, '/api/ebooks')
