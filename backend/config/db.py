from flask_pymongo import PyMongo
import os

mongo = PyMongo()

def init_app(app):
    app.config["MONGO_URI"] = os.getenv("MONGO_URI")
    mongo.init_app(app)
import os
from flask_pymongo import PyMongo
from dotenv import load_dotenv

mongo = PyMongo()

def init_app(app):
    # Load the .env file to get the MONGO_URI
    load_dotenv()
    
    # Now the environment variable is loaded, set the Mongo URI
    app.config["MONGO_URI"] = os.getenv("MONGO_URI")
    
    if not app.config["MONGO_URI"]:
        raise ValueError("MONGO_URI is not set in the environment variables.")
    
    mongo.init_app(app)
