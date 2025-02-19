from flask import Blueprint
from controllers.energyController import train,predict

energy_bp = Blueprint('energy', __name__)

energy_bp.route('/train_rfr', methods=['POST'])(train)
energy_bp.route('/predict', methods=['POST'])(predict)