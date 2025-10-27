from dotenv import load_dotenv
load_dotenv()
from flask import Flask
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from config.db import db
from models.user import User
from routes.auth_routes import auth_bp

# Import steganography routes
from routes.stego_routes import stego_bp  # You'll need to create this file

import os

app = Flask(__name__)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
    'DATABASE_URL', 'postgresql://safeer@localhost/your_database')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')

# Ensure upload folder exists for steganography
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER  # Make it available to the blueprints

# Initialize Extensions
db.init_app(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
CORS(app)

# Register Blueprints
app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(stego_bp)  # Register steganography blueprint

# Create Database Tables
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)