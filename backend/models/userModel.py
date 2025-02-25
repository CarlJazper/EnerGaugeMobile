from datetime import datetime 
import re
from werkzeug.security import generate_password_hash

def is_valid_email(email):
    """Validate email format using regex."""
    pattern = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
    return bool(re.match(pattern, email))

def is_valid_phone(phone):
    """Validate phone number format (supports international formats)."""
    pattern = r"^\+?[0-9]\d{1,14}$"  # E.164 format (max 15 digits, optional +)
    return bool(re.match(pattern, phone))

def get_user_schema(first_name, last_name, email, password, phone="", address="", city="", country="", role="user", is_verified=False):
    """Creates a user dictionary with validation and security improvements."""
    
    if not is_valid_email(email):
        raise ValueError("Invalid email format")
    
    if phone and not is_valid_phone(phone):
        raise ValueError("Invalid phone number format")

    hashed_password = generate_password_hash(password)

    return {
        "first_name": first_name,
        "last_name": last_name,
        "email": email,
        "phone": phone,  # Added phone field with validation
        "password": hashed_password,  # Store hashed password
        "address": address,
        "city": city,
        "country": country,
        "role": role,  # Default role
        "is_verified": is_verified,  # Email verification status
        "created_at": datetime.now(),
    }
