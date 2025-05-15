from flask import Blueprint, render_template, request, session, redirect, url_for, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/dashboard')
def dashboard():
    # In a real app, you'd get the username from the session
    username = session.get('username', 'Guest')
    return render_template('dashboard.html', username=username)

@chat_bp.route('/chat/<chat_id>')
def load_chat(chat_id):
    # This would load a specific chat from the database
    return {'status': 'success', 'chat_id': chat_id}

@chat_bp.route('/api/send_message', methods=['POST'])
@jwt_required(optional=True)
def send_message():
    data = request.json
    message = data.get('message', '')
    model = data.get('model', 'claude-3-5-sonnet')
    
    if not message:
        return jsonify({'status': 'error', 'message': 'No message provided'}), 400
    
    # In a real app, you would:
    # 1. Save the message to the database
    # 2. Call the appropriate LLM API based on the selected model
    # 3. Save the response to the database
    # 4. Return the response to the user
    
    # This is a mock response
    response = {
        'status': 'success',
        'response': f"This is a simulated response from {model}. You sent: {message}",
        'model': model
    }
    
    return jsonify(response)

@chat_bp.route('/api/chat_history', methods=['GET'])
def chat_history():
    # In a real app, you would fetch the user's chat history from the database
    chats = [
        {'id': 1, 'title': 'Chat 1', 'last_message': 'Hello there!', 'timestamp': '2023-05-15 14:30'},
        {'id': 2, 'title': 'Chat 2', 'last_message': 'How does AI work?', 'timestamp': '2023-05-14 10:15'},
        {'id': 3, 'title': 'Chat 3', 'last_message': 'Tell me about quantum computing', 'timestamp': '2023-05-12 16:45'},
    ]
    
    return jsonify({'status': 'success', 'chats': chats}) 