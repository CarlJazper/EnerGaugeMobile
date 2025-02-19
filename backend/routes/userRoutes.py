from flask import Blueprint, jsonify
from controllers.userController import register_user, login_user, get_user_profile,update_user_profile, get_all_users, update_user, delete_user,get_user

user_bp = Blueprint('user_bp', __name__)

user_bp.route('/register', methods=['POST'])(register_user)
user_bp.route('/login', methods=['POST'])(login_user)
user_bp.route('/profile', methods=['GET'])(get_user_profile)
user_bp.route('/profile/update', methods=['PUT'])(update_user_profile)
# New routes
user_bp.route('/userslist', methods=['GET'])(get_all_users)  # Get all users
user_bp.route('/usersdata/<user_id>', methods=['GET'])(get_user)
user_bp.route('/update/<user_id>', methods=['PUT'])(update_user)  # Update user by ID
user_bp.route('/delete/<user_id>', methods=['DELETE'])(delete_user)  # Delete user by ID
