from datetime import datetime

def get_user_schema():
    return {
        "first_name": "",
        "last_name": "",
        "address": "",
        "city": "",
        "country": "",
        "email": "",
        "password": "",
        "role": "user",  # Default role
        "created_at": datetime.utcnow()
    }
