# -*-coding:utf-8-*-
'''
图片上传相关函数
'''
import os
from werkzeug import secure_filename
from datetime import datetime
from PIL import Image
import random
import string

from app import app


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1] in app.config['ALLOWED_COVER_EXTENSIONS']

def upload_cover(fileStorage):
    imgname = ''.join(random.sample(string.ascii_letters+string.digits, 8))+'.'+fileStorage.filename.rsplit('.')[1]

    dt = datetime.now()
    img_dir = os.path.join(app.config['COVER_PATH'], str(dt.year)+str(dt.month))

    if not os.path.exists(img_dir):
        os.makedirs(img_dir)
    fileStorage.save(os.path.join(img_dir, imgname))

    img = Image.open(os.path.join(img_dir, imgname))
    w,h = img.size
    img.thumbnail((int(w*200/h),200))

    img_thumb_dir = os.path.join(app.config['COVER_THUMB_PATH'], str(dt.year)+str(dt.month))
    if not os.path.exists(img_thumb_dir):
        os.makedirs(img_thumb_dir)

    img.save(os.path.join(img_thumb_dir, imgname))
    return img_dir[img_dir.index('/media'):]+'/'+imgname
