import pickle
import os
from config.db import mongo

MODEL_PATH = "models/trainedDataForecast/arima_model.pkl"
SCALER_PATH = "models/trainedDataForecast/scaler.pkl"

def save_model(model, scaler):
    """Save the ARIMA model and scaler."""
    os.makedirs("models", exist_ok=True)
    with open(MODEL_PATH, "wb") as model_file:
        pickle.dump(model, model_file)
    with open(SCALER_PATH, "wb") as scaler_file:
        pickle.dump(scaler, scaler_file)

def load_model():
    """Load the ARIMA model and scaler if available."""
    if not os.path.exists(MODEL_PATH) or not os.path.exists(SCALER_PATH):
        return None, None
    
    with open(MODEL_PATH, "rb") as model_file:
        model = pickle.load(model_file)
    with open(SCALER_PATH, "rb") as scaler_file:
        scaler = pickle.load(scaler_file)
    
    return model, scaler

def get_forecast_history():
    """Retrieve all stored forecasts for dashboard trends."""
    forecasts = list(mongo.db.forecasts.find({}, {"_id": 0}))  # Exclude ObjectId
    return forecasts
