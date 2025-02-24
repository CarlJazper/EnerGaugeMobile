import os
import jwt
import datetime
from flask import jsonify, request, g, url_for
from werkzeug.security import generate_password_hash, check_password_hash
from config.db import mongo
from models.userModel import get_user_schema
from dotenv import load_dotenv
from middlewares.authMiddleware import token_required
from bson import ObjectId
from flask_mail import Mail, Message

# Load environment variables
load_dotenv("./config/.env")
JWT_SECRET = os.getenv("JWT_SECRET")
JWT_EXPIRATION_MINUTES = int(os.getenv("JWT_EXPIRATION_MINUTES", 60))
# Flask-Mail configuration
MAIL_SERVER = os.getenv("MAIL_SERVER")
MAIL_PORT = int(os.getenv("MAIL_PORT", 2525))
MAIL_USERNAME = os.getenv("MAIL_USERNAME")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
MAIL_USE_TLS = os.getenv("MAIL_USE_TLS", "True") == "True"
MAIL_USE_SSL = os.getenv("MAIL_USE_SSL", "False") == "True"
MAIL_FROM = os.getenv("MAIL_FROM")

mail = Mail()

def init_mail(app):
    """Initialize Flask-Mail with app"""
    app.config.update(
        MAIL_SERVER=MAIL_SERVER,
        MAIL_PORT=MAIL_PORT,
        MAIL_USERNAME=MAIL_USERNAME,
        MAIL_PASSWORD=MAIL_PASSWORD,
        MAIL_USE_TLS=MAIL_USE_TLS,
        MAIL_USE_SSL=MAIL_USE_SSL,
    )
    mail.init_app(app)

def generate_jwt(user_id,role,expires_in=JWT_EXPIRATION_MINUTES):
    """Generate JWT token"""
    payload = {
        "user_id": str(user_id),
        "role": role,
        "exp": datetime.datetime.now() + datetime.timedelta(minutes=expires_in)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def send_verification_email(email, user_id):
    token = generate_jwt(user_id, "verify", expires_in=30)  # 30 min expiry for email verification
    verification_url = url_for("user_bp.verify_email", token=token, _external=True)

    # Email content with HTML formatting
    msg = Message(
        "Verify Your Email",
        sender=MAIL_FROM,
        recipients=[email]
    )
    msg.html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2c3e50;">Welcome to EnerGauge!</h2>
        <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
        <p style="text-align: center;">
            <a href="{verification_url}" 
               style="display: inline-block; background-color: #3498db; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-size: 16px;">
                Verify Email
            </a>
        </p>
        <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
        <p style="word-wrap: break-word;"><a href="{verification_url}">{verification_url}</a></p>
        <br>
        <p>Best regards,<br><strong>EnerGauge</strong></p>
    </body>
    </html>
    """
    
    try:
        mail.send(msg)
        return True
    except Exception as e:
        print("Error sending email:", e)
        return False


def register_user():
    """User Registration with Email Verification"""
    data = request.get_json()

    # Validate required fields
    required_fields = ["first_name", "last_name", "email", "password", "phone"]
    for field in required_fields:
        if field not in data:
            return jsonify({"message": f"{field} is required"}), 400

    # Check if user already exists
    if mongo.db.users.find_one({"email": data["email"]}):
        return jsonify({"message": "User already exists"}), 400

    # Create user schema with default is_verified=False
    user_data = get_user_schema(
        first_name=data["first_name"],
        last_name=data["last_name"],
        email=data["email"],
        password=data["password"],
        address=data.get("address", ""),
        city=data.get("city", ""),
        country=data.get("country", ""),
        phone=data.get("phone", ""),  # Handle phone input
        is_verified=False
    )

    # Insert user into database
    inserted_user = mongo.db.users.insert_one(user_data)

    # Send verification email
    email_sent = send_verification_email(data["email"], inserted_user.inserted_id)
    if not email_sent:
        return jsonify({"message": "User registered but failed to send verification email"}), 500

    return jsonify({"message": "User registered successfully. Check email for verification"}), 201


def verify_email():
    """Verify user email from the token"""
    token = request.args.get("token")

    try:
        decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        user_id = decoded.get("user_id")

        user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            return jsonify({"message": "Invalid token or user not found"}), 400

        if user.get("is_verified"):
            return jsonify({"message": "Email already verified"}), 200

        # Update user verification status
        mongo.db.users.update_one({"_id": ObjectId(user_id)}, {"$set": {"is_verified": True}})
        return jsonify({"message": "Email verified successfully"}), 200

    except jwt.ExpiredSignatureError:
        return jsonify({"message": "Verification link expired"}), 400
    except jwt.InvalidTokenError:
        return jsonify({"message": "Invalid token"}), 400

def login_user():
    """Login user only if verified"""
    data = request.get_json()

    if "email" not in data or "password" not in data:
        return jsonify({"message": "Email and password are required"}), 400

    user = mongo.db.users.find_one({"email": data["email"]})
    if not user:
        return jsonify({"message": "User not found"}), 404

    if not check_password_hash(user["password"], data["password"]):
        return jsonify({"message": "Incorrect password"}), 400

    if not user.get("is_verified"):
        return jsonify({"message": "Please verify your email before logging in"}), 403

    token = generate_jwt(user["_id"], user["role"])
    return jsonify({"message": "Login successful", "token": token}), 200

#Users profile
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
    allowed_fields = ["first_name", "last_name", "address", "city", "country", "phone"]
    update_data = {field: data[field] for field in allowed_fields if field in data}

    if not update_data:
        return jsonify({"message": "No valid fields to update"}), 400

    result = mongo.db.users.update_one({"_id": ObjectId(user_id)}, {"$set": update_data})

    if result.modified_count == 0:
        return jsonify({"message": "No changes made"}), 200

    return jsonify({"message": "Profile updated successfully"}), 200


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
    allowed_fields = ["first_name", "last_name", "address", "city", "country", "phone"]
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
