from flask import Flask
from flask_jwt_extended import JWTManager
from datetime import timedelta
import os

from app.db import db

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev_key')
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt_dev_key')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
    app.config['JWT_TOKEN_LOCATION'] = ['headers', 'cookies', 'query_string']
    app.config['JWT_COOKIE_SECURE'] = False  # Set to True in production with HTTPS
    app.config['JWT_COOKIE_CSRF_PROTECT'] = False  # Set to True in production
    app.config['JWT_QUERY_STRING_NAME'] = 'token'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///ai_universe.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    db.init_app(app)
    jwt = JWTManager(app)
    
    from app.utils.logger import setup_logger
    logger = setup_logger(app)
    
    with app.app_context():
        from app.models.user_model import User
        
        logger.info("Creating database tables...")
        db.create_all()
        logger.info("Database tables created successfully.")
        
        from .routes import user_routes
        app.register_blueprint(user_routes.bp)
        
        from .routes import chat_routes
        app.register_blueprint(chat_routes.chat_bp)
        
        logger.info("Application routes registered.")

    return app
