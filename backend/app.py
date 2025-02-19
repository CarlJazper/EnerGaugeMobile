from flask import Flask
from flask_cors import CORS
from routes.energyRoutes import energy_bp
from routes.forecastRoutes import forecast_bp
from routes.userRoutes import user_bp
from config.db import init_app

app = Flask(__name__)
CORS(app)

# Initialize DB
init_app(app)

app.register_blueprint(energy_bp)
app.register_blueprint(forecast_bp)

# Register routes
app.register_blueprint(user_bp, url_prefix='/api/users')

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)  # Set port to 5000 (default Flask port)