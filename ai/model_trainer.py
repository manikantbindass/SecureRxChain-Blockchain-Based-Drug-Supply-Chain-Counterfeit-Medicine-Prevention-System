import pandas as pd
import numpy as np
from anomaly_detector import AnomalyDetector
import requests
import os
from datetime import datetime, timedelta

class ModelTrainer:
    """
    Trains and updates anomaly detection models using historical blockchain data.
    """
    
    def __init__(self, api_base_url='http://localhost:5000/api'):
        self.api_base_url = api_base_url
        self.detector = AnomalyDetector()
    
    def fetch_historical_data(self, days=90):
        """
        Fetch historical transfer data from the backend API.
        
        Args:
            days: Number of days of historical data to fetch
        
        Returns:
            DataFrame with transfer data
        """
        try:
            response = requests.get(
                f'{self.api_base_url}/transfers',
                params={'days': days}
            )
            
            if response.status_code == 200:
                data = response.json()
                df = pd.DataFrame(data['transfers'])
                print(f"Fetched {len(df)} historical transfers")
                return df
            else:
                print(f"Error fetching data: {response.status_code}")
                return pd.DataFrame()
        
        except Exception as e:
            print(f"Exception fetching data: {e}")
            return self._generate_dummy_data()
    
    def _generate_dummy_data(self, n_samples=1000):
        """
        Generate synthetic training data for development/testing.
        """
        print("Generating synthetic training data...")
        
        np.random.seed(42)
        data = []
        
        for i in range(n_samples):
            # Normal transactions (90%)
            if i < n_samples * 0.9:
                transfer = {
                    'quantity': np.random.randint(500, 2000),
                    'transfer_count': np.random.randint(1, 5),
                    'time_since_last_transfer': np.random.randint(3600, 86400),
                    'distance': np.random.randint(10, 500),
                    'price_per_unit': np.random.uniform(10, 50),
                    'batch_age_days': np.random.randint(1, 60),
                    'supplier_trust_score': np.random.randint(60, 100),
                    'location_risk_score': np.random.randint(0, 3)
                }
            # Anomalous transactions (10%)
            else:
                transfer = {
                    'quantity': np.random.choice([50, 15000]),  # Too small or too large
                    'transfer_count': np.random.randint(8, 15),  # Too many transfers
                    'time_since_last_transfer': np.random.randint(60, 1800),  # Too frequent
                    'distance': np.random.randint(1000, 8000),  # Unusual distance
                    'price_per_unit': np.random.uniform(1, 10),  # Suspiciously low price
                    'batch_age_days': np.random.randint(90, 365),  # Too old
                    'supplier_trust_score': np.random.randint(10, 40),  # Low trust
                    'location_risk_score': np.random.randint(7, 10)  # High risk location
                }
            
            data.append(transfer)
        
        return pd.DataFrame(data)
    
    def preprocess_data(self, df):
        """
        Preprocess and clean the data for training.
        """
        # Remove duplicates
        df = df.drop_duplicates()
        
        # Handle missing values
        df = df.fillna(df.median())
        
        # Remove outliers beyond reasonable bounds
        df = df[df['quantity'] > 0]
        df = df[df['quantity'] < 100000]
        
        print(f"Preprocessed {len(df)} samples")
        return df
    
    def train_model(self, training_data=None):
        """
        Train the anomaly detection model.
        
        Args:
            training_data: Optional DataFrame with training data.
                          If None, fetches from API.
        """
        if training_data is None:
            print("Fetching training data...")
            training_data = self.fetch_historical_data()
        
        if training_data.empty:
            print("No training data available. Using synthetic data.")
            training_data = self._generate_dummy_data()
        
        print("\nPreprocessing data...")
        training_data = self.preprocess_data(training_data)
        
        print("\nTraining anomaly detection model...")
        self.detector.train(training_data)
        
        # Evaluate on training data
        self._evaluate_model(training_data)
        
        print("\nSaving model...")
        self.detector.save_model()
        
        print("\n✅ Model training completed successfully!")
    
    def _evaluate_model(self, test_data):
        """
        Evaluate model performance on test data.
        """
        predictions = self.detector.predict(test_data)
        
        if isinstance(predictions, dict):
            predictions = [predictions]
        
        anomaly_count = sum(1 for p in predictions if p['is_anomaly'])
        anomaly_rate = anomaly_count / len(predictions) * 100
        
        print(f"\nModel Evaluation:")
        print(f"  Total samples: {len(predictions)}")
        print(f"  Detected anomalies: {anomaly_count}")
        print(f"  Anomaly rate: {anomaly_rate:.2f}%")
        
        # Distribution of risk levels
        risk_levels = [p['risk_level'] for p in predictions]
        for level in ['low', 'medium', 'high', 'critical']:
            count = risk_levels.count(level)
            pct = count / len(risk_levels) * 100
            print(f"  {level.capitalize()} risk: {count} ({pct:.1f}%)")
    
    def retrain_periodically(self, interval_days=7):
        """
        Schedule periodic retraining of the model.
        
        Args:
            interval_days: How often to retrain (in days)
        """
        print(f"Starting periodic retraining every {interval_days} days...")
        
        while True:
            print(f"\n[{datetime.now()}] Starting scheduled retraining...")
            self.train_model()
            print(f"\nNext retraining in {interval_days} days")
            
            # Wait for the specified interval
            import time
            time.sleep(interval_days * 24 * 60 * 60)

if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Train SecureRxChain anomaly detection model')
    parser.add_argument('--api-url', default='http://localhost:5000/api',
                       help='Backend API URL')
    parser.add_argument('--days', type=int, default=90,
                       help='Days of historical data to use')
    parser.add_argument('--synthetic', action='store_true',
                       help='Use synthetic data for training')
    parser.add_argument('--periodic', type=int,
                       help='Enable periodic retraining (days interval)')
    
    args = parser.parse_args()
    
    trainer = ModelTrainer(api_base_url=args.api_url)
    
    if args.periodic:
        trainer.retrain_periodically(interval_days=args.periodic)
    else:
        if args.synthetic:
            data = trainer._generate_dummy_data()
            trainer.train_model(training_data=data)
        else:
            trainer.train_model()
    
    print("\nTraining completed. Model is ready for use.")
