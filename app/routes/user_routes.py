from flask import Blueprint, jsonify, request, render_template, redirect, url_for, flash, current_app, make_response
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, set_access_cookies
from werkzeug.security import generate_password_hash, check_password_hash
from app.services.user_service import create_user, get_user_by_username, get_user_by_email, get_user_by_id
from app.utils.helpers import validate_email, validate_password_strength
import logging

bp = Blueprint('user_routes', __name__)
logger = logging.getLogger('app')

@bp.route('/')
def index():
    logger.info("Index page accessed")
    return render_template('index.html')

@bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        logger.info("Login page accessed")
        return render_template('login.html')
    
    data = request.form
    username = data.get('username')
    
    logger.info(f"Login attempt for user: {username}")
    
    user = get_user_by_username(username)
    password = data.get('password')
    
    if not user:
        logger.warning(f"Login failed: User not found - {username}")
        error_message = 'Invalid username or password'
        
        if request.content_type == 'application/json':
            return jsonify({"error": error_message}), 401
        
        return render_template('login.html', error=error_message)
    
    if not check_password_hash(user.password_hash, password):
        logger.warning(f"Login failed: Invalid password for user - {username}")
        error_message = 'Invalid username or password'
        
        if request.content_type == 'application/json':
            return jsonify({"error": error_message}), 401
        
        return render_template('login.html', error=error_message)
    
    logger.info(f"Login successful for user: {username}")
    access_token = create_access_token(identity=user.id)
    
    # For regular form submission, redirect with cookie
    if request.headers.get('Content-Type') == 'application/x-www-form-urlencoded':
        response = redirect(url_for('user_routes.dashboard'))
        response.set_cookie('access_token', access_token, httponly=True, path='/')
        return response
    
    # For AJAX requests, return JSON with token
    resp = jsonify(access_token=access_token, message="Login successful", username=user.username)
    resp.set_cookie('access_token', access_token, httponly=True, path='/')
    return resp

@bp.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'GET':
        logger.info("Signup page accessed")
        return render_template('signup.html')
    
    data = request.form
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    
    logger.info(f"Signup attempt for username: {username}, email: {email}")
    
    validate_input_result = validate_signup_input(username, email, password)
    if validate_input_result:
        logger.warning(f"Signup validation failed: {validate_input_result} for {username}")
        
        if request.content_type == 'application/json':
            return jsonify({"error": validate_input_result}), 400
        
        return render_template('signup.html', error=validate_input_result)
    
    password_hash = generate_password_hash(password)
    user = create_user(username, email, password_hash)
    
    logger.info(f"User created successfully: {username}, {email}")
    access_token = create_access_token(identity=user.id)
    
    # For regular form submission, redirect with cookie
    if request.headers.get('Content-Type') == 'application/x-www-form-urlencoded':
        response = redirect(url_for('user_routes.dashboard'))
        response.set_cookie('access_token', access_token, httponly=True, path='/')
        return response
    
    # For AJAX requests, return JSON with token
    resp = jsonify(access_token=access_token, message="Account created successfully", username=user.username)
    resp.set_cookie('access_token', access_token, httponly=True, path='/')
    return resp

@bp.route('/dashboard')
@jwt_required(optional=True)
def dashboard():
    current_user_id = get_jwt_identity()
    
    # Check for access token in query parameters (workaround for token issues)
    token_param = request.args.get('token')
    if token_param and not current_user_id:
        try:
            # Verify the token manually
            from flask_jwt_extended import decode_token
            decoded = decode_token(token_param)
            current_user_id = decoded.get('sub')
            logger.info(f"Using token from query parameter for user ID: {current_user_id}")
        except Exception as e:
            logger.error(f"Invalid token parameter: {str(e)}")
    
    if not current_user_id:
        logger.warning("Dashboard access attempt without authentication")
        return redirect(url_for('user_routes.login'))
    
    user = get_user_by_id(current_user_id)
    
    if not user:
        logger.warning(f"Dashboard access failed: User ID not found - {current_user_id}")
        return redirect(url_for('user_routes.login'))
    
    logger.info(f"Dashboard accessed by user: {user.username}")
    return render_template('dashboard.html', username=user.username)

@bp.route('/logout')
def logout():
    logger.info("User logged out")
    response = redirect(url_for('user_routes.index'))
    response.delete_cookie('access_token', path='/')
    return response

@bp.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user_id = get_jwt_identity()
    logger.info(f"Protected route accessed by user ID: {current_user_id}")
    return jsonify(logged_in_as=current_user_id)

def validate_signup_input(username, email, password):
    if not username or not email or not password:
        return 'All fields are required'
    
    if len(username) < 3:
        return 'Username must be at least 3 characters long'
    
    if not validate_email(email):
        return 'Invalid email format'
    
    if get_user_by_username(username):
        return 'Username already exists'
    
    if get_user_by_email(email):
        return 'Email already registered'
    
    if not validate_password_strength(password):
        return 'Password must be at least 8 characters long and include uppercase, lowercase, and numbers'
    
    return None