import logging
import os
from logging.handlers import RotatingFileHandler
from datetime import datetime

def setup_logger(app):
    log_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'logs')
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)
    
    log_file = os.path.join(log_dir, f'app_{datetime.now().strftime("%Y%m%d")}.log')
    
    file_handler = create_file_handler(log_file)
    configure_app_logger(app, file_handler)
    
    return logging.getLogger('app')

def create_file_handler(log_file):
    file_handler = RotatingFileHandler(log_file, maxBytes=10485760, backupCount=10)
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    ))
    file_handler.setLevel(logging.INFO)
    return file_handler

def configure_app_logger(app, file_handler):
    app.logger.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)
    app.logger.info('AI Universe startup') 