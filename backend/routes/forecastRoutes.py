from flask import Blueprint
from controllers.forecastController import train_sarimax, predict_forecast, get_forecast_trends,  get_user_forecast, download_forecast_csv, download_forecast_pdf


forecast_bp = Blueprint("forecast", __name__)

forecast_bp.route('/train_arima', methods=['POST'])(train_sarimax)
forecast_bp.route('/predict_forecast', methods=['POST'])(predict_forecast)
forecast_bp.route('/trends', methods=['GET'])(get_forecast_trends)
forecast_bp.route('/userforecast', methods=['GET'])(get_user_forecast)

forecast_bp.add_url_rule('/download/csv', 'download_forecast_csv', download_forecast_csv)
forecast_bp.add_url_rule('/download/pdf', 'download_forecast_pdf', download_forecast_pdf)
