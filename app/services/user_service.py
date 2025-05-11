import uuid
from app.models.user_model import User
from app.db import db

def create_user(username, email, password_hash):
    user_id = str(uuid.uuid4())
    user = User(id=user_id, username=username, email=email, password_hash=password_hash)
    db.session.add(user)
    db.session.commit()
    return user

def get_user_by_id(user_id):
    return User.query.get(user_id)

def get_user_by_username(username):
    return User.query.filter_by(username=username).first()

def get_user_by_email(email):
    return User.query.filter_by(email=email).first()

def get_all_users():
    return User.query.all() 