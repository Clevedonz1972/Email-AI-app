from flask import Flask, request, jsonify
from flask_jwt_extended import (
    JWTManager, create_access_token, 
    jwt_required, get_jwt_identity
)
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import timedelta
from ai.handlers import AIHandler

app = Flask(__name__)
CORS(app, supports_credentials=True)

# Configuration
app.config['JWT_SECRET_KEY'] = 'your-secret-key'  # Change this in production!
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
jwt = JWTManager(app)

# Mock user storage (replace with database in production)
users = {}

ai_handler = AIHandler()

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Missing email or password'}), 400
        
    if email in users:
        return jsonify({'error': 'Email already registered'}), 409
        
    users[email] = {
        'id': len(users) + 1,
        'email': email,
        'password_hash': generate_password_hash(password)
    }
    
    access_token = create_access_token(identity=email)
    return jsonify({
        'token': access_token,
        'user': {
            'id': users[email]['id'],
            'email': email
        }
    }), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    user = users.get(email)
    if not user or not check_password_hash(user['password_hash'], password):
        return jsonify({'error': 'Invalid credentials'}), 401
        
    access_token = create_access_token(identity=email)
    return jsonify({
        'token': access_token,
        'user': {
            'id': user['id'],
            'email': email
        }
    })

@app.route('/api/auth/verify', methods=['GET'])
@jwt_required()
def verify_token():
    current_user = get_jwt_identity()
    user = users.get(current_user)
    return jsonify({
        'id': user['id'],
        'email': user['email']
    })

# Protect existing email routes
@app.route('/api/emails', methods=['GET'])
@jwt_required()
def get_emails():
    # Your existing email fetching logic here
    pass

@app.route('/api/ai/summarize', methods=['POST'])
@jwt_required()
def summarize_email():
    data = request.json
    content = data.get('content')
    if not content:
        return jsonify({'error': 'No content provided'}), 400
    
    result = ai_handler.summarize_email(content)
    if result['success']:
        return jsonify(result)
    return jsonify({'error': result['error']}), 500

@app.route('/api/ai/priority', methods=['POST'])
@jwt_required()
def analyze_priority():
    data = request.json
    content = data.get('content')
    if not content:
        return jsonify({'error': 'No content provided'}), 400
    
    result = ai_handler.analyze_priority(content)
    if result['success']:
        return jsonify(result)
    return jsonify({'error': result['error']}), 500

@app.route('/api/ai/generate-reply', methods=['POST'])
@jwt_required()
def generate_reply():
    data = request.json
    content = data.get('content')
    if not content:
        return jsonify({'error': 'No content provided'}), 400
    
    result = ai_handler.generate_reply(content)
    if result['success']:
        return jsonify(result)
    return jsonify({'error': result['error']}), 500 