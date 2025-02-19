import os
import jwt
import datetime
from flask import jsonify, request, g
from werkzeug.security import generate_password_hash, check_password_hash
from config.db import mongo
from models.userModel import get_user_schema
from dotenv import load_dotenv
from middlewares.authMiddleware import token_required
from bson import ObjectId

# Load environment variables
load_dotenv("./config/.env")
JWT_SECRET = os.getenv("JWT_SECRET")
JWT_EXPIRATION_MINUTES = int(os.getenv("JWT_EXPIRATION_MINUTES", 60))

def generate_jwt(user_id,role):
    """Generate JWT token"""
    payload = {
        "user_id": str(user_id),
        "role": role,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=JWT_EXPIRATION_MINUTES)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

@token_required
def get_user_profile():
    """Get user profile details"""
    user_id = g.user_id  # Use `g.user_id` instead of `request.user_id`
    user = mongo.db.users.find_one({"_id": ObjectId(user_id)}, {"password": 0})  # Exclude password

    if not user:
        return jsonify({"message": "User not found"}), 404

    user["_id"] = str(user["_id"])  # Convert ObjectId to string for JSON response
    return jsonify(user), 200


@token_required
def update_user_profile():
    """Update user profile"""
    user_id = g.user_id
    data = request.get_json()

    # Only allow updates to certain fields
    allowed_fields = ["first_name", "last_name", "address", "city", "country"]
    update_data = {field: data[field] for field in allowed_fields if field in data}

    if not update_data:
        return jsonify({"message": "No valid fields to update"}), 400

    result = mongo.db.users.update_one({"_id": ObjectId(user_id)}, {"$set": update_data})

    if result.modified_count == 0:
        return jsonify({"message": "No changes made"}), 200

    return jsonify({"message": "Profile updated successfully"}), 200


def register_user():
    data = request.get_json()
    user_data = get_user_schema()

    # Validate required fields
    for field in ['first_name', 'last_name', 'email', 'password']:
        if field not in data:
            return jsonify({"message": f"{field} is required"}), 400

    # Check if user already exists
    existing_user = mongo.db.users.find_one({"email": data['email']})
    if existing_user:
        return jsonify({"message": "User already exists"}), 400

    # Hash password
    hashed_password = generate_password_hash(data['password'])

    # Prepare user data
    user_data.update({
        "first_name": data['first_name'],
        "last_name": data['last_name'],
        "address": data.get('address', ''),
        "city": data.get('city', ''),
        "country": data.get('country', ''),
        "email": data['email'],
        "password": hashed_password
    })

    # Insert user into database
    inserted_user = mongo.db.users.insert_one(user_data)
    # After registering or logging in the user, get the role and generate the JWT token
    role = user_data.get('role', 'user')  # Default to 'user' if role is not set
    token = generate_jwt(inserted_user.inserted_id, role)


    return jsonify({"message": "User registered successfully", "token": token}), 201

def login_user():
    data = request.get_json()

    # Validate required fields
    if 'email' not in data or 'password' not in data:
        return jsonify({"message": "Email and password are required"}), 400

    # Check if user exists
    user = mongo.db.users.find_one({"email": data['email']})
    if not user:
        return jsonify({"message": "User not found"}), 404

    # Verify password
    if not check_password_hash(user['password'], data['password']):
        return jsonify({"message": "Incorrect password"}), 400
    
    role = user.get('role', 'user')  # Default to 'user' if no role is set
    print(f"User role from backend: {role}")  # Log role for debugging

    # Generate JWT token
    token = generate_jwt(user["_id"], role)

    return jsonify({
        "message": "Login successful",
        "token": token,
        "role": role  # Make sure this is part of the response
    }), 200


# Get all users
@token_required
def get_all_users():
    """Get all users"""
    users = mongo.db.users.find({}, {"password": 0})  # Exclude password field

    users_list = []
    for user in users:
        user["_id"] = str(user["_id"])  # Convert ObjectId to string for JSON response
        users_list.append(user)

    return jsonify(users_list), 200

# Get user by ID
@token_required
def get_user(user_id):
    """Get user details by ID"""
    user = mongo.db.users.find_one({"_id": ObjectId(user_id)}, {"password": 0})  # Exclude password field

    if not user:
        return jsonify({"message": "User not found"}), 404

    user["_id"] = str(user["_id"])  # Convert ObjectId to string for JSON response
    return jsonify(user), 200

# Update user by ID
@token_required
def update_user(user_id):
    """Update user details by ID"""
    data = request.get_json()

    # Only allow updates to certain fields
    allowed_fields = ["first_name", "last_name", "address", "city", "country"]
    update_data = {field: data[field] for field in allowed_fields if field in data}

    if not update_data:
        return jsonify({"message": "No valid fields to update"}), 400

    result = mongo.db.users.update_one({"_id": ObjectId(user_id)}, {"$set": update_data})

    if result.modified_count == 0:
        return jsonify({"message": "No changes made"}), 200

    return jsonify({"message": "User updated successfully"}), 200


# Delete user by ID
@token_required
def delete_user(user_id):
    """Delete user by ID"""
    result = mongo.db.users.delete_one({"_id": ObjectId(user_id)})

    if result.deleted_count == 0:
        return jsonify({"message": "User not found"}), 404

    return jsonify({"message": "User deleted successfully"}), 200
