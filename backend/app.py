from flask import Flask
from flask_cors import CORS
from routes.forecastRoutes import forecast_bp
from routes.userRoutes import user_bp
from config.db import init_app
from controllers.userController import init_mail

app = Flask(__name__)
CORS(app)

# Initialize DB
init_app(app)
init_mail(app)

app.register_blueprint(forecast_bp)
# Register routes
app.register_blueprint(user_bp, url_prefix='/api/users')

if __name__ == "__main__":
    app.run(debug=True)
