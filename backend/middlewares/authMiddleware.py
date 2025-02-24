from flask import request, jsonify, g
import os
import jwt
from functools import wraps
from dotenv import load_dotenv

# Load environment variables
load_dotenv("./config/.env")
JWT_SECRET = os.getenv("JWT_SECRET")

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        # Check if token is in headers
        if "Authorization" in request.headers:
            token = request.headers["Authorization"].split(" ")[1]  # "Bearer <token>"

        if not token:
            return jsonify({"message": "Token is missingss"}), 401

        try:
            # Decode token
            decoded_data = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            g.user_id = decoded_data["user_id"]  # Attach user_id to `g` instead of `request`
            g.role = decoded_data.get("role") 
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message": "Invalid token"}), 401

        return f(*args, **kwargs)

    return decorated
