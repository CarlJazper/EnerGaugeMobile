from flask import Blueprint
from controllers.forecastController import train_arima, predict_forecast, get_forecast_trends


forecast_bp = Blueprint("forecast", __name__)

forecast_bp.route('/train_arima', methods=['POST'])(train_arima)
forecast_bp.route('/predict_forecast', methods=['POST'])(predict_forecast)
forecast_bp.route('/trends', methods=['GET'])(get_forecast_trends)