import os
import json
import tempfile
from flask import Flask, request, jsonify
import firebase_admin
from firebase_admin import credentials, auth
from functools import wraps

# Load Firebase credentials from environment variable
firebase_credentials = os.getenv("FIREBASE_CREDENTIALS")

if not firebase_credentials:
    raise ValueError("FIREBASE_CREDENTIALS environment variable is not set")

try:
    # Parse the JSON string into a dictionary
    cred_dict = json.loads(firebase_credentials)

    # Write the dictionary to a temporary file
    with tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".json") as temp_file:
        json.dump(cred_dict, temp_file, indent=2)  # Ensure proper JSON formatting
        temp_file_path = temp_file.name

    # Debug: Print the temporary file path and contents
    print("Temporary file path:", temp_file_path)
    with open(temp_file_path, "r") as f:
        print("Temporary file contents:", f.read())

    # Use the temporary file to initialize Firebase
    cred = credentials.Certificate(temp_file_path)
    firebase_admin.initialize_app(cred)

    # Clean up the temporary file after initialization
    os.unlink(temp_file_path)
except json.JSONDecodeError as e:
    raise ValueError(f"Invalid JSON in FIREBASE_CREDENTIALS: {e}")
except Exception as e:
    raise ValueError(f"Failed to initialize Firebase: {e}")

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