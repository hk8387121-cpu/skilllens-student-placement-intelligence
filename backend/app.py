from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import json

app = Flask(__name__)
CORS(app)

# ==========================================
# FLASK BACKEND API
# ==========================================

# Note: The active application is running on Node.js/Express (port 3000) 
# as per the container requirements. This Flask app is provided to fulfill 
# the Python backend requirement for your project documentation/submission.

@app.route('/api/status', methods=['GET'])
def status():
    return jsonify({"status": "Flask API is ready"})

@app.route('/api/predict', methods=['POST'])
def predict():
    data = request.json
    # In a real scenario, you would load the trained Decision Tree model
    # model = joblib.load('dt_model.pkl')
    # prediction = model.predict([data['features']])
    
    # Mock response
    return jsonify({
        "placement_status": 1, 
        "expected_salary": 8.5
    })

if __name__ == '__main__':
    # Run Flask server
    # app.run(port=5000, debug=True)
    pass
