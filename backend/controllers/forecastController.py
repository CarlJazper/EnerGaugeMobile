from flask import Blueprint, request, jsonify, g, Response, make_response
import pandas as pd
import numpy as np
from statsmodels.tsa.statespace.sarimax import SARIMAX
from sklearn.preprocessing import MinMaxScaler
from models.forecastModel import save_model, load_model
from config.db import mongo
from bson import ObjectId
import datetime
import io
import csv
from middlewares.authMiddleware import token_required
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
import matplotlib.pyplot as plt
from reportlab.pdfgen import canvas
from matplotlib.backends.backend_pdf import FigureCanvasPdf

forecast_bp = Blueprint('forecast', __name__)

@token_required  
def train_sarimax():
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

    # Convert timestamp and sort by date
    df["Timestamp"] = pd.to_datetime(df["Timestamp"])
    df.set_index("Timestamp", inplace=True)
    df = df.sort_index()

    # Convert categorical values to numerical
    df["HVACUsage"] = df["HVACUsage"].map({"On": 1, "Off": 0})
    df["LightingUsage"] = df["LightingUsage"].map({"On": 1, "Off": 0})
    df["Holiday"] = df["Holiday"].map({"Yes": 1, "No": 0})

    # Ensure consistent DayOfWeek mapping
    day_mapping = {
        "Sunday": 0, "Monday": 1, "Tuesday": 2, "Wednesday": 3,
        "Thursday": 4, "Friday": 5, "Saturday": 6
    }
    df["DayOfWeek"] = df["DayOfWeek"].map(day_mapping).fillna(0).astype(int)

    # Normalize DayOfWeek to 0-1 scale
    df["DayOfWeek"] = df["DayOfWeek"] / 6.0  

    # Scale features using MinMaxScaler
    feature_columns = [
        "Temperature", "Humidity", "SquareFootage", "Occupancy",
        "HVACUsage", "LightingUsage", "RenewableEnergy", "DayOfWeek", "Holiday"
    ]
    scaler = MinMaxScaler()
    df[feature_columns] = scaler.fit_transform(df[feature_columns])

    # Scale target variable
    energy_scaler = MinMaxScaler()
    df["EnergyConsumption"] = energy_scaler.fit_transform(df[["EnergyConsumption"]])

    # Train SARIMAX Model
    model = SARIMAX(
        df["EnergyConsumption"], 
        exog=df[feature_columns],  
        order=(5,1,0),            
        seasonal_order=(1,1,1,24) 
    )
    
    fitted_model = model.fit()

    # Save the trained model and scalers
    save_model(fitted_model, energy_scaler, scaler)

    return jsonify({"message": "SARIMAX model trained successfully."})

@token_required 
def predict_forecast():
    model, energy_scaler, feature_scaler = load_model()
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

    # Convert categorical values to numerical
    feature_df["HVACUsage"] = feature_df["HVACUsage"].astype(int)
    feature_df["LightingUsage"] = feature_df["LightingUsage"].astype(int)
    feature_df["Holiday"] = feature_df["Holiday"].map({"Yes": 1, "No": 0}).fillna(0).astype(int)

    # Normalize DayOfWeek to 0-1 scale
    feature_df["DayOfWeek"] = feature_df["DayOfWeek"] / 6.0  

    # Scale the features
    feature_df_scaled = feature_scaler.transform(feature_df[required_features])

    # Generate forecast
    forecast = model.predict(start=len(feature_df), end=len(feature_df) + len(future_dates) - 1, exog=feature_df_scaled)
    forecast = energy_scaler.inverse_transform(np.array(forecast).reshape(-1, 1)).flatten()
    forecast = np.maximum(forecast, 0)

    avg_renewable_energy = np.mean(feature_df["RenewableEnergy"])
    energy_savings = forecast * (avg_renewable_energy / 100)
    peak_load = max(forecast)

    # Estimate feature contributions (Fixed Negative Issue)
    feature_sums = np.abs(feature_df_scaled).sum(axis=1)[:, None]
    contributions = np.abs(feature_df_scaled) * (forecast[:, None] / feature_sums)
    contributions = pd.DataFrame(contributions, columns=required_features)

    # Fetch user details
    user = mongo.db.users.find_one({"_id": ObjectId(g.user_id)}, {"first_name": 1, "last_name": 1})
    first_name = user.get("first_name", "Unknown") if user else "Unknown"
    last_name = user.get("last_name", "Unknown") if user else "Unknown"

    # Save forecast details
    forecast_entry = {
        "user_id": ObjectId(g.user_id),
        "first_name": first_name,
        "last_name": last_name,
        "timestamp": datetime.datetime.now(),
        "forecast_data": [
            {
                "timestamp": ts.isoformat(),
                "forecast_energy": round(energy, 2),
                "energy_savings": round(savings, 2),
                "peak_load": round(peak_load, 2),
                "feature_contributions": {feat: round(contributions.iloc[i][feat], 2) for feat in required_features}
            }
            for i, (ts, energy, savings) in enumerate(zip(future_dates, forecast, energy_savings))
        ]
    }

    mongo.db.forecasts.insert_one(forecast_entry)
    return jsonify({
        "forecast_data": forecast_entry["forecast_data"],
        "peak_load": forecast_entry["forecast_data"][0]["peak_load"],
        "first_name": first_name,
        "last_name": last_name
    })

@token_required
def get_forecast_trends():
    if g.role != "admin":
        return jsonify({"error": "Unauthorized"}), 403

    # Fetch all forecast records (including new ones)
    forecasts = list(mongo.db.forecasts.find({}, {
        "_id": 1, "user_id": 1, "timestamp": 1, "forecast_data": 1
    }))

    # Fetch total users count
    total_users = mongo.db.users.count_documents({})
    
    # Get unique users who made forecasts
    unique_user_ids = set(forecast["user_id"] for forecast in forecasts)
    total_users_forecasting = len(unique_user_ids)

    # Fetch user details for each unique user_id
    user_details = {str(user["_id"]): user for user in mongo.db.users.find({}, {"_id": 1, "first_name": 1, "last_name": 1})}

    # Initialize summary metrics
    total_energy = 0
    total_energy_savings = 0
    peak_loads = []
    all_features = {  
        "Temperature": 0, "Humidity": 0, "SquareFootage": 0, "Occupancy": 0,
        "HVACUsage": 0, "LightingUsage": 0, "RenewableEnergy": 0, "DayOfWeek": 0, "Holiday": 0
    }
    total_entries = 0

    for forecast in forecasts:
        forecast["_id"] = str(forecast["_id"])
        forecast["user_id"] = str(forecast["user_id"])
        forecast["timestamp"] = forecast.get("timestamp", datetime.datetime.now()).isoformat()

        # Attach user details if available
        user_info = user_details.get(forecast["user_id"], {})
        forecast["first_name"] = user_info.get("first_name", "Unknown")
        forecast["last_name"] = user_info.get("last_name", "Unknown")

        # Compute total forecasted energy and energy savings
        total_forecast_energy = sum(entry["forecast_energy"] for entry in forecast.get("forecast_data", []))
        total_energy_savings_entry = sum(entry["energy_savings"] for entry in forecast.get("forecast_data", []))
        peak_load = max(entry["forecast_energy"] for entry in forecast.get("forecast_data", [])) if forecast.get("forecast_data") else 0

        # Aggregate values
        total_energy += total_forecast_energy
        total_energy_savings += total_energy_savings_entry
        peak_loads.append(peak_load)

        # Summing up feature data for trend analysis
        for entry in forecast.get("forecast_data", []):
            features = entry.get("feature_contributions", {})
            for key in all_features:
                all_features[key] += features.get(key, 0)
            total_entries += 1

        # Update forecast object
        forecast["total_forecast_energy"] = round(total_forecast_energy, 2)
        forecast["total_energy_savings"] = round(total_energy_savings_entry, 2)
        forecast["peak_load"] = round(peak_load, 2)

    # Compute averages for features
    avg_features = {
        key: round(value / total_entries, 2) if total_entries else 0 for key, value in all_features.items()
    }
    average_peak_load = round(np.mean(peak_loads), 2) if peak_loads else 0

    return jsonify({
        "forecasts": forecasts,
        "total_forecasts": len(forecasts),
        "total_energy": round(total_energy, 2),
        "total_energy_savings": round(total_energy_savings, 2),
        "average_peak_load": average_peak_load,
        "average_features": avg_features,
        "total_users": total_users,
        "total_users_forecasting": total_users_forecasting
    })

@token_required
def get_user_forecast():
    user_id = ObjectId(g.user_id)

    # Fetch all user forecasts
    forecasts = list(mongo.db.forecasts.find({"user_id": user_id}, {"_id": 0, "timestamp": 1, "forecast_data": 1}))

    if not forecasts:
        return jsonify({"message": "No forecasts found for the user."}), 404

    # Initialize trend analysis
    total_energy = 0
    total_savings = 0
    peak_loads = []
    forecast_count = len(forecasts)
    energy_by_weekday = {i: [] for i in range(7)}  # Store values for averaging

    factor_sums = { 
        "Temperature": 0, "Humidity": 0, "SquareFootage": 0, "Occupancy": 0,
        "HVACUsage": 0, "LightingUsage": 0, "RenewableEnergy": 0, "Holiday": 0
    }
    factor_counts = {key: 0 for key in factor_sums}  # To calculate averages

    for forecast in forecasts:
        # Ensure timestamp is in ISO format
        forecast["timestamp"] = forecast["timestamp"].isoformat() if isinstance(forecast["timestamp"], datetime.datetime) else str(forecast["timestamp"])

        for entry in forecast.get("forecast_data", []):
            forecast_energy = entry.get("forecast_energy", 0)
            energy_savings = entry.get("energy_savings", 0)
            peak_load = entry.get("peak_load", 0)

            total_energy += forecast_energy
            total_savings += energy_savings
            peak_loads.append(peak_load)

            # Extract weekday trends
            timestamp = entry.get("timestamp")
            if timestamp:
                try:
                    weekday = datetime.datetime.fromisoformat(timestamp).weekday()
                    energy_by_weekday[weekday].append(forecast_energy)
                except ValueError:
                    pass  # Skip invalid timestamps

            # Aggregate feature contributions safely
            for key in factor_sums:
                if "feature_contributions" in entry and key in entry["feature_contributions"]:
                    factor_sums[key] += entry["feature_contributions"][key]
                    factor_counts[key] += 1

    # Compute averages safely
    avg_peak_load = round(np.mean(peak_loads), 2) if peak_loads else 0
    min_peak_load = round(min(peak_loads), 2) if peak_loads else 0
    max_peak_load = round(max(peak_loads), 2) if peak_loads else 0
    avg_factors = {key: round(factor_sums[key] / factor_counts[key], 2) if factor_counts[key] > 0 else 0 for key in factor_sums}
    avg_energy_by_weekday = {k: round(np.mean(v), 2) if v else 0 for k, v in energy_by_weekday.items()}

    return jsonify({
        "total_forecasts": forecast_count,
        "total_energy": round(total_energy, 2),
        "total_savings": round(total_savings, 2),
        "avg_peak_load": avg_peak_load,
        "min_peak_load": min_peak_load,
        "max_peak_load": max_peak_load,
        "avg_factors": avg_factors,
        "energy_by_weekday": avg_energy_by_weekday,
        "forecasts": forecasts
    })

@token_required
def download_forecast_csv():
    try:
        user_id = ObjectId(g.user_id)

        # Fetch all user forecasts
        forecasts = list(mongo.db.forecasts.find({"user_id": user_id}, {"_id": 0, "timestamp": 1, "forecast_data": 1}))

        if not forecasts:
            return jsonify({"message": "No forecasts found for the user."}), 404

        # Prepare CSV data
        csv_output = io.StringIO()
        csv_writer = csv.writer(csv_output)

        # Add header
        csv_writer.writerow(["Timestamp", "Forecast Energy", "Energy Savings", "Peak Load", "Feature Contributions"])

        for forecast in forecasts:
            for entry in forecast.get("forecast_data", []):
                timestamp = entry.get("timestamp")
                forecast_energy = entry.get("forecast_energy", 0)
                energy_savings = entry.get("energy_savings", 0)
                peak_load = entry.get("peak_load", 0)
                feature_contributions = ", ".join([f"{key}: {value}" for key, value in entry.get("feature_contributions", {}).items()])

                csv_writer.writerow([timestamp, forecast_energy, energy_savings, peak_load, feature_contributions])

        # Make the StringIO object seekable
        csv_output.seek(0)

        # Send the file as response
        return Response(csv_output.getvalue(), mimetype="text/csv", headers={"Content-Disposition": "attachment;filename=forecast_data.csv"})
    except Exception as e:
        print(f"Error in download_forecast_csv: {str(e)}")  # Log the error
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500

@token_required
def download_forecast_pdf():
    user_id = ObjectId(g.user_id)

    # Fetch all user forecasts
    forecasts = list(mongo.db.forecasts.find({"user_id": user_id}, {"_id": 0, "timestamp": 1, "forecast_data": 1}))

    if not forecasts:
        return jsonify({"message": "No forecasts found for the user."}), 404

    # Create PDF document
    pdf_output = io.BytesIO()
    c = canvas.Canvas(pdf_output, pagesize=letter)

    # Set font and styles
    c.setFont("Helvetica", 10)

    # Add some title
    c.drawString(100, 750, "Forecast Data")
    c.drawString(100, 730, f"User ID: {str(user_id)}")

    y_position = 710
    for forecast in forecasts:
        c.drawString(100, y_position, f"Timestamp: {forecast['timestamp']}")
        y_position -= 20

        for entry in forecast.get("forecast_data", []):
            c.drawString(100, y_position, f"Forecast Energy: {entry.get('forecast_energy')}")
            c.drawString(100, y_position - 15, f"Energy Savings: {entry.get('energy_savings')}")
            c.drawString(100, y_position - 30, f"Peak Load: {entry.get('peak_load')}")
            c.drawString(100, y_position - 45, f"Feature Contributions: {entry.get('feature_contributions')}")
            y_position -= 60

            if y_position < 100:  # Handle page overflow
                c.showPage()
                y_position = 750

    # Save the PDF
    c.save()

    # Send the PDF file as response
    pdf_output.seek(0)
    response = make_response(pdf_output.read())
    response.headers["Content-Type"] = "application/pdf"
    response.headers["Content-Disposition"] = "attachment;filename=forecast_data.pdf"
    return response
