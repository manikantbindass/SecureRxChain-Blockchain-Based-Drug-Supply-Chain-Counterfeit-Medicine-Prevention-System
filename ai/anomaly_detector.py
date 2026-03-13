import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import joblib
import os
from datetime import datetime

class AnomalyDetector:
    """
    AI-based anomaly detection for supply chain activities.
    Detects suspicious patterns like:
    - Unusual transfer frequencies
    - Abnormal batch quantities
    - Irregular timestamp patterns
    - Geographic anomalies
    """
    
    def __init__(self, model_path='models/anomaly_model.pkl'):
        self.model_path = model_path
        self.scaler = StandardScaler()
        self.model = None
        self.contamination = 0.1  # Expected anomaly rate
        
        if os.path.exists(model_path):
            self.load_model()
        else:
            self.model = IsolationForest(
                contamination=self.contamination,
                random_state=42,
                n_estimators=100
            )
    
    def extract_features(self, transaction_data):
        """
        Extract features from transaction data for anomaly detection.
        
        Args:
            transaction_data: Dictionary or DataFrame with transaction info
        
        Returns:
            numpy array of features
        """
        if isinstance(transaction_data, dict):
            transaction_data = pd.DataFrame([transaction_data])
        
        features = []
        
        for _, row in transaction_data.iterrows():
            feature_vector = [
                row.get('quantity', 0),
                row.get('transfer_count', 0),
                row.get('time_since_last_transfer', 0),
                row.get('distance', 0),
                row.get('price_per_unit', 0),
                row.get('batch_age_days', 0),
                row.get('supplier_trust_score', 50),
                row.get('location_risk_score', 0)
            ]
            features.append(feature_vector)
        
        return np.array(features)
    
    def train(self, training_data):
        """
        Train the anomaly detection model.
        
        Args:
            training_data: DataFrame with historical transaction data
        """
        features = self.extract_features(training_data)
        features_scaled = self.scaler.fit_transform(features)
        self.model.fit(features_scaled)
        
        print(f"Model trained on {len(training_data)} samples")
    
    def predict(self, transaction_data):
        """
        Predict if transactions are anomalous.
        
        Args:
            transaction_data: Transaction data to analyze
        
        Returns:
            Dictionary with prediction results
        """
        features = self.extract_features(transaction_data)
        features_scaled = self.scaler.transform(features)
        
        # Predict: -1 for anomaly, 1 for normal
        predictions = self.model.predict(features_scaled)
        # Get anomaly scores (lower = more anomalous)
        anomaly_scores = self.model.decision_function(features_scaled)
        
        results = []
        for i, (pred, score) in enumerate(zip(predictions, anomaly_scores)):
            results.append({
                'is_anomaly': pred == -1,
                'anomaly_score': float(score),
                'confidence': abs(score),
                'risk_level': self._get_risk_level(score)
            })
        
        return results[0] if len(results) == 1 else results
    
    def _get_risk_level(self, score):
        """
        Convert anomaly score to risk level.
        """
        if score < -0.5:
            return 'critical'
        elif score < -0.2:
            return 'high'
        elif score < 0:
            return 'medium'
        else:
            return 'low'
    
    def detect_batch_anomaly(self, batch_history):
        """
        Analyze entire batch history for anomalies.
        
        Args:
            batch_history: List of all transfers for a batch
        
        Returns:
            Analysis results with detected anomalies
        """
        if not batch_history:
            return {'anomalies_detected': False, 'details': []}
        
        df = pd.DataFrame(batch_history)
        
        # Add derived features
        df['time_since_last_transfer'] = df['timestamp'].diff().dt.total_seconds().fillna(0)
        df['batch_age_days'] = (datetime.now() - df['timestamp'].min()).days
        
        predictions = self.predict(df)
        
        anomalies = []
        for i, pred in enumerate(predictions):
            if pred['is_anomaly']:
                anomalies.append({
                    'transfer_index': i,
                    'transfer_data': batch_history[i],
                    'reason': self._diagnose_anomaly(batch_history[i]),
                    **pred
                })
        
        return {
            'anomalies_detected': len(anomalies) > 0,
            'anomaly_count': len(anomalies),
            'total_transfers': len(batch_history),
            'details': anomalies
        }
    
    def _diagnose_anomaly(self, transfer):
        """
        Provide human-readable reason for anomaly detection.
        """
        reasons = []
        
        if transfer.get('quantity', 0) > 10000:
            reasons.append('Unusually large quantity')
        if transfer.get('time_since_last_transfer', 0) < 3600:
            reasons.append('Transfer too soon after previous')
        if transfer.get('distance', 0) > 5000:
            reasons.append('Unusually long distance transfer')
        if transfer.get('supplier_trust_score', 50) < 30:
            reasons.append('Low supplier trust score')
        
        return reasons if reasons else ['Statistical anomaly detected']
    
    def save_model(self):
        """
        Save trained model to disk.
        """
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        joblib.dump({
            'model': self.model,
            'scaler': self.scaler
        }, self.model_path)
        print(f"Model saved to {self.model_path}")
    
    def load_model(self):
        """
        Load trained model from disk.
        """
        data = joblib.load(self.model_path)
        self.model = data['model']
        self.scaler = data['scaler']
        print(f"Model loaded from {self.model_path}")

if __name__ == '__main__':
    # Example usage
    detector = AnomalyDetector()
    
    # Example transaction
    transaction = {
        'quantity': 1000,
        'transfer_count': 3,
        'time_since_last_transfer': 7200,
        'distance': 150,
        'price_per_unit': 25.5,
        'batch_age_days': 10,
        'supplier_trust_score': 85,
        'location_risk_score': 2
    }
    
    # For initial training, create dummy data
    training_data = pd.DataFrame([
        {**transaction, 'quantity': np.random.randint(500, 2000)} 
        for _ in range(100)
    ])
    
    detector.train(training_data)
    result = detector.predict(transaction)
    print(f"Anomaly detection result: {result}")
    
    detector.save_model()
