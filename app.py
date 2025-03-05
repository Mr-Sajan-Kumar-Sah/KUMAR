from flask import Flask, request, jsonify
import firebase_admin
from firebase_admin import credentials, auth
from functools import wraps
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Firebase Admin SDK
cred = credentials.Certificate("serviceAccountKey.json")  # Download this file from Firebase Console
firebase_admin.initialize_app(cred)

# Create Flask app
app = Flask(__name__)

# Middleware to check authentication
def check_auth(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        id_token = request.headers.get("Authorization")
        if not id_token:
            return jsonify({"error": "Unauthorized"}), 401

        try:
            # Verify the Firebase ID token
            decoded_token = auth.verify_id_token(id_token.split("Bearer ")[1])
            request.user = decoded_token
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({"error": "Unauthorized"}), 401
    return wrapper

# Protected route
@app.route("/manage_blog", methods=["GET"])
@check_auth
def manage_blog():
    return jsonify({"message": "Welcome to Manage Blog", "user": request.user})

# Start the server
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 3000))
    app.run(host="0.0.0.0", port=port)