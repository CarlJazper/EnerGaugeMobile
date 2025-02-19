from flask import Blueprint, request, jsonify, g
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
from models.energyModel import save_model, load_model, preprocess_data
from middlewares.authMiddleware import token_required

energy_bp = Blueprint('energy', __name__)

@token_required
def train():
    if g.role != "admin":
        return jsonify({"error": "Unauthorized"}), 403

    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    try:
        df = pd.read_csv(file)
    except Exception as e:
        return jsonify({"error": f"Error reading file: {str(e)}"}), 400

    if "Timestamp" in df.columns:
        df["Timestamp"] = pd.to_datetime(df["Timestamp"], errors='coerce')
        df["Timestamp"] = df["Timestamp"].astype(int) // 10**9  # Convert to Unix timestamp

    required_columns = [
        "Temperature", "Humidity", "SquareFootage", "Occupancy",
        "HVACUsage", "LightingUsage", "RenewableEnergy",
        "DayOfWeek", "Holiday", "EnergyConsumption"
    ]
    
    if not all(col in df.columns for col in required_columns):
        return jsonify({"error": "Missing required columns"}), 400

    df["HVACUsage"] = df["HVACUsage"].map({"On": 1, "Off": 0})
    df["LightingUsage"] = df["LightingUsage"].map({"On": 1, "Off": 0})
    df["Holiday"] = df["Holiday"].map({"Yes": 1, "No": 0})

    df = pd.get_dummies(df, columns=["DayOfWeek"], drop_first=True)

    X = df.drop(columns=["EnergyConsumption"])
    y = df["EnergyConsumption"]

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    metrics = {
        "R2 Score": r2_score(y_test, y_pred),
        "MAE": mean_absolute_error(y_test, y_pred),
        "RMSE": mean_squared_error(y_test, y_pred) ** 0.5,
    }

    trained_columns = list(X.columns)
    save_model(model, scaler, trained_columns)

    return jsonify({"message": "Model trained successfully", "metrics": metrics})

@token_required
def predict():
    model, scaler = load_model()
    if model is None or scaler is None:
        return jsonify({"error": "Model not trained yet"}), 400

    if 'file' in request.files:
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        try:
            df = pd.read_csv(file)
        except Exception as e:
            return jsonify({"error": f"Error reading file: {str(e)}"}), 400
    else:
        try:
            data = request.get_json()
            if not data:
                return jsonify({"error": "No input provided"}), 400
            df = pd.DataFrame([data])
        except Exception as e:
            return jsonify({"error": f"Invalid input format: {str(e)}"}), 400

    if "Timestamp" in df.columns:
        df["Timestamp"] = pd.to_datetime(df["Timestamp"], errors='coerce')
        df["Timestamp"] = df["Timestamp"].astype(int) // 10**9

    trained_columns = joblib.load("models/trainedData/columns.pkl")
    required_columns = [
        "Temperature", "Humidity", "SquareFootage", "Occupancy",
        "HVACUsage", "LightingUsage", "RenewableEnergy",
        "DayOfWeek", "Holiday"
    ]
    
    missing_columns = [col for col in required_columns if col not in df.columns]
    if missing_columns:
        return jsonify({"error": f"Missing required columns: {', '.join(missing_columns)}"}), 400

    try:
        X_scaled = preprocess_data(df, scaler)
        prediction = model.predict(X_scaled)
    except Exception as e:
        return jsonify({"error": f"Prediction error: {str(e)}"}), 500

    df['predicted_consumption'] = prediction
    return jsonify(df.to_dict(orient='records'))