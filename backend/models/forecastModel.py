import joblib
import os
from config.db import mongo

MODEL_PATH = "models/trainedDataForecast/sarimax_model.pkl"
SCALER_PATH = "models/trainedDataForecast/energy_scaler.pkl"
FEATURE_SCALER_PATH = "models/trainedDataForecast/feature_scaler.pkl"

def save_model(model, energy_scaler, feature_scaler):
    """Save the SARIMAX model and scalers."""
    os.makedirs("models/trainedDataForecast", exist_ok=True)
    
    joblib.dump(model, MODEL_PATH)
    joblib.dump(energy_scaler, SCALER_PATH)
    joblib.dump(feature_scaler, FEATURE_SCALER_PATH)

def load_model():
    """Load the SARIMAX model and scalers if available."""
    if not os.path.exists(MODEL_PATH) or not os.path.exists(SCALER_PATH) or not os.path.exists(FEATURE_SCALER_PATH):
        return None, None, None
    
    model = joblib.load(MODEL_PATH)
    energy_scaler = joblib.load(SCALER_PATH)
    feature_scaler = joblib.load(FEATURE_SCALER_PATH)

    return model, energy_scaler, feature_scaler

def get_forecast_history():
    """Retrieve all stored forecasts for dashboard trends."""
    forecasts = list(mongo.db.forecasts.find({}, {"_id": 0}))  # Exclude ObjectId
    return forecasts
