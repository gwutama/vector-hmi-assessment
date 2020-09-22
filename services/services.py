#!/usr/bin/env python3

"""
Run with:
$ FLASK_APP=services.py flask run
"""

from flask import Flask, jsonify
from flask_cors import CORS
from random import randint

app = Flask(__name__)
CORS(app)

@app.route('/media/metadata')
def media_metadata():
    data_list = []

    for i in range(0, 60):
        if i % 2:
            data_list.append({
                "title": "Big Buck Bunny",
                "year": "2008",
                "poster": "images/bigbuckbunny.jpg",
                "media": "movies/bigbuckbunny1080p.mp4"
            })
        else:
            data_list.append({
                "title": "Sintel",
                "year": "2010",
                "poster": "images/sintel.jpg",
                "media": "movies/sinteltrailer1080p.mp4"
            })

    return jsonify({
        'metadata': data_list
    })

@app.route('/positioning/eta')
def positioning_eta():
    return jsonify({
        'eta': randint(1, 120)
    })