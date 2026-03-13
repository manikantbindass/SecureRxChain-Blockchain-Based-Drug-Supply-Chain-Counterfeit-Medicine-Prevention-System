import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
import joblib
import os
from datetime import datetime

class CounterfeitRiskPredictor:
    """
    Logistic Regression model for predicting counterfeit drug risk.
    
    Features:
    - num_transfers: Number of times the drug has been transferred
    - days_since_manufacture: Days elapsed since manufacturing
    - distributor_score: Trust score of distributors (0-100)
    
    Output:
    - risk_score: Probability of being counterfeit (0-100%)
    """
    
    def __init__(self, model_path='models/risk_model.pkl'):
        self.model_path = model_path
        self.scaler = StandardScaler()
        self.model = None
        
        if os.path.exists(model_path):
            self.load_model()
        else:
            # Initialize with pre-trained weights
            self.model = LogisticRegression(random_state=42, max_iter=1000)
            self._train_initial_model()
    
    def _train_initial_model(self):
        """
        Train initial model with synthetic data based on domain knowledge.
        """
        # Generate synthetic training data
        np.random.seed(42)
        n_samples = 1000
        
        # Legitimate drugs (70%)
        legitimate_samples = int(n_samples * 0.7)
        X_legit = np.array([
            np.random.randint(1, 5, legitimate_samples),      # Low transfers
            np.random.randint(1, 90, legitimate_samples),     # Recent manufacture
            np.random.randint(70, 100, legitimate_samples)    # High distributor score
        ]).T
        y_legit = np.zeros(legitimate_samples)
        
        # Counterfeit drugs (30%)
        counterfeit_samples = n_samples - legitimate_samples
        X_counterfeit = np.array([
            np.random.randint(5, 15, counterfeit_samples),    # Many transfers
            np.random.randint(90, 365, counterfeit_samples),  # Old manufacture
            np.random.randint(0, 50, counterfeit_samples)     # Low distributor score
        ]).T
        y_counterfeit = np.ones(counterfeit_samples)
        
        # Combine datasets
        X = np.vstack([X_legit, X_counterfeit])
        y = np.concatenate([y_legit, y_counterfeit])
        
        # Shuffle data
        indices = np.random.permutation(len(X))
        X = X[indices]
        y = y[indices]
        
        # Train model
        X_scaled = self.scaler.fit_transform(X)
        self.model.fit(X_scaled, y)
        
        print(f"Initial model trained on {len(X)} samples")
        print(f"Model accuracy: {self.model.score(X_scaled, y):.2%}")
    
    def predict_risk(self, num_transfers, days_since_manufacture, distributor_score):
        """
        Predict counterfeit risk for a drug.
        
        Args:
            num_transfers: Number of supply chain transfers
            days_since_manufacture: Days since manufacturing date
            distributor_score: Trust score of distributors (0-100)
        
        Returns:
            dict: {
                'risk_score': float (0-100),
                'risk_level': str ('low', 'medium', 'high', 'critical'),
                'is_suspicious': bool,
                'factors': list of contributing risk factors
            }
        """
        # Prepare input features
        X = np.array([[num_transfers, days_since_manufacture, distributor_score]])
        X_scaled = self.scaler.transform(X)
        
        # Get probability prediction
        risk_probability = self.model.predict_proba(X_scaled)[0][1]
        risk_score = float(risk_probability * 100)
        
        # Determine risk level
        if risk_score < 25:
            risk_level = 'low'
        elif risk_score < 50:
            risk_level = 'medium'
        elif risk_score < 75:
            risk_level = 'high'
        else:
            risk_level = 'critical'
        
        # Identify contributing factors
        factors = []
        if num_transfers > 6:
            factors.append('Excessive supply chain transfers')
        if days_since_manufacture > 180:
            factors.append('Old manufacturing date')
        if distributor_score < 60:
            factors.append('Low distributor trust score')
        
        return {
            'risk_score': round(risk_score, 2),
            'risk_level': risk_level,
            'is_suspicious': risk_score >= 50,
            'factors': factors,
            'prediction_timestamp': datetime.now().isoformat(),
            'model_confidence': round(max(risk_probability, 1 - risk_probability) * 100, 2)
        }
    
    def batch_predict(self, batch_data):
        """
        Predict risk for multiple drugs at once.
        
        Args:
            batch_data: List of dicts with keys: num_transfers, days_since_manufacture, distributor_score
        
        Returns:
            List of prediction results
        """
        results = []
        for data in batch_data:
            prediction = self.predict_risk(
                data['num_transfers'],
                data['days_since_manufacture'],
                data['distributor_score']
            )
            prediction['input_data'] = data
            results.append(prediction)
        
        return results
    
    def retrain(self, X_train, y_train):
        """
        Retrain model with new data.
        
        Args:
            X_train: Training features (num_transfers, days_since_manufacture, distributor_score)
            y_train: Labels (0 = legitimate, 1 = counterfeit)
        """
        X_scaled = self.scaler.fit_transform(X_train)
        self.model.fit(X_scaled, y_train)
        accuracy = self.model.score(X_scaled, y_train)
        print(f"Model retrained. Accuracy: {accuracy:.2%}")
        return accuracy
    
    def get_feature_importance(self):
        """
        Get model coefficients to understand feature importance.
        """
        coefficients = self.model.coef_[0]
        feature_names = ['num_transfers', 'days_since_manufacture', 'distributor_score']
        
        importance = [
            {
                'feature': name,
                'coefficient': float(coef),
                'importance': abs(float(coef))
            }
            for name, coef in zip(feature_names, coefficients)
        ]
        
        # Sort by absolute importance
        importance.sort(key=lambda x: x['importance'], reverse=True)
        return importance
    
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
    predictor = CounterfeitRiskPredictor()
    
    # Test predictions
    print("\n=== Test Predictions ===")
    
    # Legitimate drug example
    result1 = predictor.predict_risk(
        num_transfers=2,
        days_since_manufacture=30,
        distributor_score=95
    )
    print(f"\nLegitimate Drug: {result1}")
    
    # Suspicious drug example
    result2 = predictor.predict_risk(
        num_transfers=10,
        days_since_manufacture=200,
        distributor_score=35
    )
    print(f"\nSuspicious Drug: {result2}")
    
    # Feature importance
    print("\n=== Feature Importance ===")
    importance = predictor.get_feature_importance()
    for feat in importance:
        print(f"{feat['feature']}: {feat['coefficient']:.4f}")
    
    # Save model
    predictor.save_model()
