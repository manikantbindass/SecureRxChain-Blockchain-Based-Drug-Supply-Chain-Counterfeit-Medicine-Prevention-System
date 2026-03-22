# SecureRxChain API Documentation

This document outlines the primary REST APIs exposed by the Node.js Backend Server and the external Python AI Risk Prediction Engine.

## Backend Node.js Server
**Base URL:** `http://localhost:5000/api`

### 1. Authentication
All protected routes require an `Authorization: Bearer <jwt_token>` header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login, returns JWT & User Info |

### 2. Drug Supply Chain
Endpoints interacting with the Blockchain Smart Contracts and MongoDB.

| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| POST | `/drugs/register` | Register new drug batch on blockchain & DB | Manufacturer |
| POST | `/drugs/transfer` | Transfer drug ownership to new node | Manufacturer, Distributor |
| POST | `/drugs/sell` | Mark drug as sold to consumer | Pharmacy |
| GET | `/drugs/verify/:batchId` | Verify drug authenticity, history, & AI risk score | Any (Public) |

---

## Python AI Service
**Base URL:** `http://localhost:5002`

*Note: The Node.js server automatically proxies risk assessment data to this service during Consumer Verifications.*

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Verify if the ML Model is active |
| POST | `/predict-risk` | Calculate 0-100 Anomaly Risk based on `num_transfers`, `days_since_manufacture`, and `distributor_score` |
| POST | `/model/retrain` | Retrain model with new verified dataset |
| GET | `/model/info` | Fetch Logistic Regression feature importance algorithms |
