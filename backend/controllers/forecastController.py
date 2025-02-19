from flask import Blueprint, request, jsonify, g
import pandas as pd
import numpy as np
from statsmodels.tsa.arima.model import ARIMA
from sklearn.preprocessing import MinMaxScaler
from models.forecastModel import save_model, load_model
from config.db import mongo
from bson import ObjectId
import datetime
from middlewares.authMiddleware import token_required

forecast_bp = Blueprint('forecast', __name__)

@token_required  
def train_arima():
    if g.role != "admin":
        return jsonify({"error": "Unauthorized"}), 403

    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    try:
        df = pd.read_csv(file)
    except Exception as e:
        return jsonify({"error": f"Error reading file: {str(e)}"}), 400

    required_columns = [
        "Timestamp", "Temperature", "Humidity", "SquareFootage", "Occupancy",
        "HVACUsage", "LightingUsage", "RenewableEnergy", "DayOfWeek",
        "Holiday", "EnergyConsumption"
    ]
    
    if not all(col in df.columns for col in required_columns):
        return jsonify({"error": "CSV must contain required energy forecasting columns"}), 400
    
    df["Timestamp"] = pd.to_datetime(df["Timestamp"])
    df.set_index("Timestamp", inplace=True)
    df = df.sort_index()
    
    df["HVACUsage"] = df["HVACUsage"].map({"On": 1, "Off": 0})
    df["LightingUsage"] = df["LightingUsage"].map({"On": 1, "Off": 0})
    df["Holiday"] = df["Holiday"].map({"Yes": 1, "No": 0})
    df["DayOfWeek"] = pd.Categorical(df["DayOfWeek"]).codes

    scaler = MinMaxScaler()
    feature_columns = [
        "Temperature", "Humidity", "SquareFootage", "Occupancy",
        "HVACUsage", "LightingUsage", "RenewableEnergy", "DayOfWeek", "Holiday"
    ]
    df[feature_columns] = scaler.fit_transform(df[feature_columns])
    energy_scaler = MinMaxScaler()
    df["EnergyConsumption"] = energy_scaler.fit_transform(df[["EnergyConsumption"]])

    model = ARIMA(df["EnergyConsumption"], order=(5,1,0))
    fitted_model = model.fit()

    save_model(fitted_model, energy_scaler)
    
    return jsonify({"message": "ARIMA model trained successfully."})

@token_required  
def predict_forecast():
    model, energy_scaler = load_model()
    if model is None:
        return jsonify({"error": "No trained model found."}), 400

    try:
        data = request.get_json()
        future_timestamps = data.get("timestamps", [])
        feature_inputs = data.get("features", [])
    except Exception as e:
        return jsonify({"error": f"Invalid input: {str(e)}"}), 400

    if not future_timestamps or not feature_inputs or len(future_timestamps) != len(feature_inputs):
        return jsonify({"error": "Provide matching timestamps and feature values."}), 400

    future_dates = pd.to_datetime(future_timestamps)
    feature_df = pd.DataFrame(feature_inputs)

    required_features = ["Temperature", "Humidity", "SquareFootage", "Occupancy",
                         "HVACUsage", "LightingUsage", "RenewableEnergy", "DayOfWeek", "Holiday"]

    if not all(col in feature_df.columns for col in required_features):
        return jsonify({"error": f"Missing required feature columns: {required_features}"}), 400

    feature_df["HVACUsage"] = feature_df["HVACUsage"].map({"On": 1, "Off": 0})
    feature_df["LightingUsage"] = feature_df["LightingUsage"].map({"On": 1, "Off": 0})
    feature_df["Holiday"] = feature_df["Holiday"].map({"Yes": 1, "No": 0})
    feature_df["DayOfWeek"] = pd.Categorical(feature_df["DayOfWeek"]).codes

    forecast = model.forecast(steps=len(feature_df))
    forecast = energy_scaler.inverse_transform(np.array(forecast).reshape(-1, 1)).flatten()
    forecast = np.maximum(forecast, 0)

    avg_renewable_energy = np.mean(feature_df["RenewableEnergy"])
    energy_savings = forecast * (avg_renewable_energy / 100)
    peak_load = max(forecast)

    forecast_entry = {
        "user_id": ObjectId(g.user_id),
        "timestamp": datetime.datetime.utcnow(),
        "forecast_data": [
            {
                "timestamp": ts.isoformat(),
                "forecast_energy": round(energy, 2),
                "energy_savings": round(savings, 2)
            }
            for ts, energy, savings in zip(future_dates, forecast, energy_savings)
        ],
        "peak_load": round(peak_load, 2)
    }
    mongo.db.forecasts.insert_one(forecast_entry)

    return jsonify({
        "forecast_data": forecast_entry["forecast_data"],
        "peak_load": forecast_entry["peak_load"]
    })

@token_required
def get_forecast_trends():
    if g.role != "admin":
        return jsonify({"error": "Unauthorized"}), 403

    # Fetch all forecast records
    forecasts = list(mongo.db.forecasts.find({}, {"_id": 1, "user_id": 1, "timestamp": 1, "forecast_data": 1, "peak_load": 1}))

    # Calculate summary metrics
    total_energy = 0
    total_energy_savings = 0
    peak_loads = []

    for forecast in forecasts:
        forecast["_id"] = str(forecast["_id"])
        forecast["user_id"] = str(forecast["user_id"])
        forecast["timestamp"] = forecast.get("timestamp", datetime.datetime.utcnow()).isoformat()
        
        # Sum energy consumption and savings
        forecast["total_forecast_energy"] = round(sum(entry["forecast_energy"] for entry in forecast.get("forecast_data", [])), 2)
        forecast["total_energy_savings"] = round(sum(entry["energy_savings"] for entry in forecast.get("forecast_data", [])), 2)
        forecast["peak_load"] = round(forecast.get("peak_load", 0), 2)

        total_energy += forecast["total_forecast_energy"]
        total_energy_savings += forecast["total_energy_savings"]
        peak_loads.append(forecast["peak_load"])

    average_peak_load = round(np.mean(peak_loads), 2) if peak_loads else 0

    return jsonify({
        "forecasts": forecasts,
        "total_forecasts": len(forecasts),  # No need to count documents separately
        "total_energy": round(total_energy, 2),
        "total_energy_savings": round(total_energy_savings, 2),
        "average_peak_load": average_peak_load
    })
