# AI Models Documentation

This folder documents the active AI/ML components used for anomaly detection securely embedded within the SecureRxChain platform.

## Purpose

Provides predictive risk scores and automated supply chain validation to verify product authenticity, replacing manual checks with scalable, intelligent fraud detection.

## Components

### Anomaly Detection & Risk Prediction Engine
Identifies suspicious supply chain behaviors that may indicate counterfeit activities off-chain.

**Capabilities**:
- Identifies unrealistic transfer velocities.
- Analyzes distributor trust reputation variables.
- Flags suspicious or prolonged time delays since manufacture.
- Emits real-time 0-100 `risk_scores` directly integrated with the Consumer Verification dashboard.

**Models**:
- **Isolation Forest**: Utilized via `app.py` on Port 5001 for broad outlier detection on high-dimensional supply chain data.
- **Logistic Regression**: Utilized via `risk_api.py` on Port 5002 as the primary inference engine feeding directly into the Node.js Express Backend.

**Technology Stack**:
- Python 3.12+
- Scikit-Learn
- Pandas & NumPy
- Flask framework for REST API proxying
- Joblib for model persistence

## Current Status

**Status**: Active & Deployed

The ML models run seamlessly in tandem with the Node.js API, intercepting Consumer QR Code verifications and returning immediate risk probabilities alongside the Blockchain integrity hashes.
