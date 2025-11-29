from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
import os
import uuid
from datetime import datetime

app = Flask(__name__)
# Enable CORS for all routes so React can communicate with this backend
CORS(app)

# --- Database Configuration ---
# Get MongoDB URI from environment variable (Docker) or default to localhost
# In Docker Compose, the host will be 'mongo' (service name)
MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/maplenotes')

try:
    # Connect to MongoDB
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    db = client.get_database() # Connects to the database specified in URI ('maplenotes')
    
    # Test the connection
    client.server_info()
    print(f"✅ Connected to MongoDB at {MONGO_URI}")
except Exception as e:
    print(f"❌ Failed to connect to MongoDB: {e}")

# Define Collections
users_collection = db.users
notes_collection = db.notes

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy", 
        "database": "mongodb",
        "backend": "flask"
    }), 200

# --- AUTH ROUTES ---

@app.route('/auth/signup', methods=['POST'])
def signup():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({"error": "Missing credentials"}), 400

    # Check if user already exists
    if users_collection.find_one({"username": username}):
        return jsonify({"error": "Username already taken"}), 400

    user_id = str(uuid.uuid4())
    
    # Create User Document
    user_doc = {
        "UserId": user_id,
        "username": username,
        "password": password, # In production, hash this password!
        "createdAt": datetime.utcnow().isoformat()
    }
    
    users_collection.insert_one(user_doc)
    
    return jsonify({'userId': user_id, 'username': username}), 201

@app.route('/auth/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    # Find user
    user = users_collection.find_one({"username": username})

    if user and user['password'] == password:
        return jsonify({
            'userId': user['UserId'],
            'username': user['username']
        }), 200
    else:
        return jsonify({"error": "Invalid credentials"}), 401

# --- NOTES ROUTES ---

@app.route('/notes/<user_id>', methods=['GET'])
def get_notes(user_id):
    # Fetch notes for this user
    # { "_id": 0 } excludes the internal MongoDB ObjectID from the result
    cursor = notes_collection.find({"UserId": user_id}, {"_id": 0})
    notes = list(cursor)
    
    # Optional: Sort by newest first based on createdAt string
    # notes.sort(key=lambda x: x.get('createdAt', ''), reverse=True)
    
    return jsonify(notes), 200

@app.route('/notes', methods=['POST'])
def create_note():
    data = request.json
    user_id = data.get('userId')
    title = data.get('title')
    content = data.get('content')

    if not user_id or not title:
        return jsonify({"error": "Missing data"}), 400

    note_id = str(uuid.uuid4())
    timestamp = datetime.utcnow().isoformat()

    note_doc = {
        "UserId": user_id,
        "NoteId": note_id,
        "title": title,
        "content": content,
        "createdAt": timestamp
    }

    notes_collection.insert_one(note_doc)
    
    # Remove _id before returning to frontend to avoid JSON serialization errors
    note_doc.pop('_id', None)
    
    return jsonify(note_doc), 201

@app.route('/notes/<note_id>', methods=['DELETE'])
def delete_note(note_id):
    # Frontend sends userId in body for verification (optional but good practice)
    # data = request.json 
    
    result = notes_collection.delete_one({"NoteId": note_id})
    
    if result.deleted_count > 0:
        return jsonify({"message": "Deleted successfully"}), 200
    else:
        return jsonify({"error": "Note not found"}), 404

if __name__ == '__main__':
    # host='0.0.0.0' is required for Docker containers to be accessible
    app.run(host='0.0.0.0', port=5000, debug=True)