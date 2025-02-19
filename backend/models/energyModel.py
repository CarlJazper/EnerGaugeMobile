import os
import joblib
import pandas as pd

MODEL_PATH = "models/trainedData/energy_model.pkl"
SCALER_PATH = "models/trainedData/scaler.pkl"
COLUMNS_PATH = "models/trainedData/columns.pkl"

# Load existing model and scaler if available
def load_model():
    if os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH):
        model = joblib.load(MODEL_PATH)
        scaler = joblib.load(SCALER_PATH)
    else:
        model, scaler = None, None
    return model, scaler

def save_model(model, scaler, trained_columns):
    joblib.dump(model, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)
    joblib.dump(trained_columns, COLUMNS_PATH)  # Save feature names

def preprocess_data(df, scaler):
    required_columns = [
        "Temperature", "Humidity", "SquareFootage", "Occupancy",
        "HVACUsage", "LightingUsage", "RenewableEnergy",
        "DayOfWeek", "Holiday"
    ]

    if not all(col in df.columns for col in required_columns):
        raise ValueError("Missing required columns in input data")

    # Convert categorical features
    df["HVACUsage"] = df["HVACUsage"].map({"On": 1, "Off": 0})
    df["LightingUsage"] = df["LightingUsage"].map({"On": 1, "Off": 0})
    df["Holiday"] = df["Holiday"].map({"Yes": 1, "No": 0})

    # One-hot encode "DayOfWeek"
    df = pd.get_dummies(df, columns=["DayOfWeek"], drop_first=True)

    # Load trained columns from file
    if os.path.exists(COLUMNS_PATH):
        trained_columns = joblib.load(COLUMNS_PATH)
    else:
        raise ValueError("Trained columns file missing. Retrain the model.")

    # Ensure consistency: Add missing columns (if any) with default 0
    for col in trained_columns:
        if col not in df.columns:
            df[col] = 0  

    # Keep column order same as training
    df = df[trained_columns]

    # Scale the data
    X_scaled = scaler.transform(df)
    return X_scaled
