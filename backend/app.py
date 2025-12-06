from flask import Flask, jsonify, request
from flask_cors import CORS
import boto3
import os
import uuid
from datetime import datetime
from boto3.dynamodb.conditions import Key

app = Flask(__name__)
CORS(app)

# --- DynamoDB Configuration ---
AWS_REGION = os.getenv("AWS_REGION", "ap-south-1")
TABLE_NAME = os.getenv("DYNAMODB_TABLE", "MappleNotes")

dynamodb = boto3.resource("dynamodb", region_name=AWS_REGION)
table = dynamodb.Table(TABLE_NAME)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy",
        "database": "dynamodb",
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

    # Check if username exists (DynamoDB query with GSI recommended)
    response = table.query(
        IndexName="username-index",
        KeyConditionExpression=Key('username').eq(username)
    )

    if response.get('Items'):
        return jsonify({"error": "Username already taken"}), 400

    user_id = str(uuid.uuid4())
    timestamp = datetime.utcnow().isoformat()

    user_item = {
        "PK": f"USER#{user_id}",
        "SK": "PROFILE",
        "UserId": user_id,
        "username": username,
        "password": password,
        "createdAt": timestamp
    }

    table.put_item(Item=user_item)

    return jsonify({"userId": user_id, "username": username}), 201

@app.route('/auth/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    # Query username from GSI
    response = table.query(
        IndexName="username-index",
        KeyConditionExpression=Key('username').eq(username)
    )

    items = response.get('Items', [])

    if not items:
        return jsonify({"error": "Invalid credentials"}), 401

    user = items[0]

    if user["password"] == password:
        return jsonify({
            "userId": user["UserId"],
            "username": user["username"]
        }), 200

    return jsonify({"error": "Invalid credentials"}), 401

# --- NOTES ROUTES ---

@app.route('/notes/<user_id>', methods=['GET'])
def get_notes(user_id):
    response = table.query(
        KeyConditionExpression=Key('PK').eq(f"USER#{user_id}")
    )

    notes = [item for item in response['Items'] if item.get("SK").startswith("NOTE#")]

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

    note_item = {
        "PK": f"USER#{user_id}",
        "SK": f"NOTE#{note_id}",
        "UserId": user_id,
        "NoteId": note_id,
        "title": title,
        "content": content,
        "createdAt": timestamp
    }

    table.put_item(Item=note_item)

    return jsonify(note_item), 201

@app.route('/notes/<note_id>', methods=['DELETE'])
def delete_note(note_id):
    user_id = request.args.get("userId")

    if not user_id:
        return jsonify({"error": "Missing userId"}), 400

    response = table.delete_item(
        Key={
            "PK": f"USER#{user_id}",
            "SK": f"NOTE#{note_id}"
        }
    )

    return jsonify({"message": "Deleted successfully"}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
