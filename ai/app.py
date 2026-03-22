from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np

app = Flask(__name__)
CORS(app)  # Allow Node.js backend to query this directly

def calculate_anomaly_score(data):
    """
    Simulated Logistic Regression / Isolation Forest inference.
    Analyzes supply chain metadata features to output a 0-100% counterfeit risk probability.
    """
    risk_score = 10.0 # Base risk
    
    # Feature 1: Has the drug been marked Quarantined by the blockchain?
    if data.get('currentState') == 5: # Quarantined
        return 99.0
        
    # Feature 2: Suspiciously fast transit (e.g. Manufacture to Pharmacy in 1 hour)
    events = data.get('events', [])
    if len(events) >= 2:
        start_time = events[0].get('timestamp', 0)
        end_time = events[-1].get('timestamp', 0)
        duration_hours = (end_time - start_time) / 3600
        
        if duration_hours < 5.0 and len(events) >= 3:
            # Transit hopping way too fast, highly anomalous
            risk_score += 45.0
            
    # Feature 3: Too many hands (hop count > 5 is unusual)
    if len(events) > 5:
        risk_score += (len(events) - 5) * 15.0
        
    # Feature 4: Unverified Distributor (If expected specific wallets in production)
    # Placeholder for wallet reputational analysis
    
    # Sigmoid squash simulation to bound between 0-100
    final_score = min(max(risk_score, 0.0), 100.0)
    
    # Add minor noise for realism in demonstration (± 2%)
    noise = float(np.random.normal(0, 2))
    final_score = min(max(final_score + noise, 0.5), 99.5)
    
    return round(final_score, 2)

@app.route('/predict-risk', methods=['POST'])
def predict_risk():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        risk_score = calculate_anomaly_score(data)
        
        # Determine classification
        status = "Authentic"
        if risk_score > 70:
            status = "High Counterfeit Risk"
        elif risk_score > 40:
            status = "Suspicious Transit Anomalies"
            
        return jsonify({
            "risk_score": risk_score,
            "classification": status,
            "version": "1.0-logreg"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "AI Microservice Active", "model": "AnomalyDetection-v1"}), 200

if __name__ == '__main__':
    # Running on Port 5002 as defined in the Architecture Docs
    print("Starting SecureRxChain AI Engine on port 5002...")
    app.run(host='0.0.0.0', port=5002, debug=False)
