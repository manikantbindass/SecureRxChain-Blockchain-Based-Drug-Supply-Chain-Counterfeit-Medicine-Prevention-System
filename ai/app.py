from flask import Flask, request, jsonify
from flask_cors import CORS
from anomaly_detector import AnomalyDetector
import os
import logging

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize anomaly detector
detector = AnomalyDetector()

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'service': 'ai-anomaly-detection'}), 200

@app.route('/api/ai/detect', methods=['POST'])
def detect_anomaly():
    try:
        data = request.json
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        result = detector.predict(data)
        
        return jsonify({
            'success': True,
            'result': result
        }), 200
    
    except Exception as e:
        logger.error(f'Error detecting anomaly: {str(e)}')
        return jsonify({'error': str(e)}), 500

@app.route('/api/ai/batch-analyze', methods=['POST'])
def analyze_batch():
    try:
        data = request.json
        batch_history = data.get('batch_history', [])
        
        if not batch_history:
            return jsonify({'error': 'No batch history provided'}), 400
        
        result = detector.detect_batch_anomaly(batch_history)
        
        return jsonify({
            'success': True,
            'analysis': result
        }), 200
    
    except Exception as e:
        logger.error(f'Error analyzing batch: {str(e)}')
        return jsonify({'error': str(e)}), 500

@app.route('/api/ai/model/info', methods=['GET'])
def model_info():
    return jsonify({
        'model_type': 'Isolation Forest',
        'features': [
            'quantity',
            'transfer_count',
            'time_since_last_transfer',
            'distance',
            'price_per_unit',
            'batch_age_days',
            'supplier_trust_score',
            'location_risk_score'
        ],
        'status': 'active'
    }), 200

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=False)
