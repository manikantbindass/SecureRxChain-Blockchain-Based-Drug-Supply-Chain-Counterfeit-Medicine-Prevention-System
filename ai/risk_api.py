from flask import Flask, request, jsonify
from flask_cors import CORS
from risk_predictor import CounterfeitRiskPredictor
import os
import logging
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for Node.js backend integration

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize risk predictor
predictor = CounterfeitRiskPredictor()
logger.info("Risk predictor initialized successfully")

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for monitoring."""
    return jsonify({
        'status': 'healthy',
        'service': 'counterfeit-risk-prediction',
        'model': 'Logistic Regression',
        'timestamp': datetime.now().isoformat()
    }), 200

@app.route('/predict-risk', methods=['POST'])
def predict_risk():
    """
    Main endpoint for counterfeit risk prediction.
    
    Expected JSON body:
    {
        "num_transfers": int,
        "days_since_manufacture": int,
        "distributor_score": float (0-100)
    }
    
    Returns:
    {
        "success": bool,
        "risk_score": float (0-100),
        "risk_level": str,
        "is_suspicious": bool,
        "factors": list,
        "model_confidence": float
    }
    """
    try:
        # Get request data
        data = request.json
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        # Validate required fields
        required_fields = ['num_transfers', 'days_since_manufacture', 'distributor_score']
        missing_fields = [field for field in required_fields if field not in data]
        
        if missing_fields:
            return jsonify({
                'success': False,
                'error': f"Missing required fields: {', '.join(missing_fields)}"
            }), 400
        
        # Extract features
        num_transfers = int(data['num_transfers'])
        days_since_manufacture = int(data['days_since_manufacture'])
        distributor_score = float(data['distributor_score'])
        
        # Validate input ranges
        if num_transfers < 0:
            return jsonify({
                'success': False,
                'error': 'num_transfers must be non-negative'
            }), 400
        
        if days_since_manufacture < 0:
            return jsonify({
                'success': False,
                'error': 'days_since_manufacture must be non-negative'
            }), 400
        
        if not (0 <= distributor_score <= 100):
            return jsonify({
                'success': False,
                'error': 'distributor_score must be between 0 and 100'
            }), 400
        
        # Predict risk
        result = predictor.predict_risk(
            num_transfers=num_transfers,
            days_since_manufacture=days_since_manufacture,
            distributor_score=distributor_score
        )
        
        # Log prediction
        logger.info(f"Prediction: transfers={num_transfers}, days={days_since_manufacture}, "
                   f"score={distributor_score} => risk={result['risk_score']}%")
        
        return jsonify({
            'success': True,
            **result
        }), 200
    
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        return jsonify({
            'success': False,
            'error': f"Invalid input: {str(e)}"
        }), 400
    
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500

@app.route('/predict-risk/batch', methods=['POST'])
def predict_risk_batch():
    """
    Batch prediction endpoint for multiple drugs.
    
    Expected JSON body:
    {
        "drugs": [
            {
                "id": str (optional),
                "num_transfers": int,
                "days_since_manufacture": int,
                "distributor_score": float
            },
            ...
        ]
    }
    """
    try:
        data = request.json
        
        if not data or 'drugs' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing "drugs" array in request body'
            }), 400
        
        drugs = data['drugs']
        
        if not isinstance(drugs, list):
            return jsonify({
                'success': False,
                'error': '"drugs" must be an array'
            }), 400
        
        # Predict for each drug
        results = predictor.batch_predict(drugs)
        
        logger.info(f"Batch prediction completed for {len(results)} drugs")
        
        return jsonify({
            'success': True,
            'count': len(results),
            'predictions': results
        }), 200
    
    except Exception as e:
        logger.error(f"Batch prediction error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500

@app.route('/model/info', methods=['GET'])
def model_info():
    """Get model information and feature importance."""
    try:
        importance = predictor.get_feature_importance()
        
        return jsonify({
            'success': True,
            'model_type': 'Logistic Regression',
            'features': [
                'num_transfers',
                'days_since_manufacture',
                'distributor_score'
            ],
            'feature_importance': importance,
            'model_status': 'active'
        }), 200
    
    except Exception as e:
        logger.error(f"Model info error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500

@app.route('/model/retrain', methods=['POST'])
def retrain_model():
    """
    Endpoint to retrain model with new data.
    
    Expected JSON body:
    {
        "training_data": [
            {
                "num_transfers": int,
                "days_since_manufacture": int,
                "distributor_score": float,
                "is_counterfeit": bool
            },
            ...
        ]
    }
    """
    try:
        data = request.json
        
        if not data or 'training_data' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing training_data'
            }), 400
        
        training_data = data['training_data']
        
        # Extract features and labels
        import numpy as np
        X = np.array([[d['num_transfers'], d['days_since_manufacture'], d['distributor_score']] 
                      for d in training_data])
        y = np.array([1 if d['is_counterfeit'] else 0 for d in training_data])
        
        # Retrain model
        accuracy = predictor.retrain(X, y)
        predictor.save_model()
        
        logger.info(f"Model retrained with {len(training_data)} samples. Accuracy: {accuracy:.2%}")
        
        return jsonify({
            'success': True,
            'message': 'Model retrained successfully',
            'accuracy': float(accuracy),
            'training_samples': len(training_data)
        }), 200
    
    except Exception as e:
        logger.error(f"Retraining error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': 'Endpoint not found'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5002))
    host = os.getenv('HOST', '0.0.0.0')
    
    logger.info(f"Starting Counterfeit Risk Prediction API on {host}:{port}")
    app.run(host=host, port=port, debug=False)
