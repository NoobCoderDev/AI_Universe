from flask import Blueprint, jsonify

bp = Blueprint('user_routes', __name__)

@bp.route('/')
def index():
    return jsonify({"message": "Welcome to the AI Universe!"})