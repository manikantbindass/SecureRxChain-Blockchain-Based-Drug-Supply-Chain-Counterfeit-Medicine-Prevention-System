# SecureRxChain API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login, returns JWT |
| GET | `/auth/me` | Get current user (protected) |
| POST | `/auth/logout` | Logout |

## Drug Batches

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/batches` | List all batches | Any |
| POST | `/batches` | Create new batch | Manufacturer |
| GET | `/batches/:id` | Get batch details | Any |
| PUT | `/batches/:id/transfer` | Transfer batch | Holder |
| POST | `/batches/:id/recall` | Recall batch | Admin/Regulator |
| GET | `/batches/:id/history` | Get transfer history | Any |
| GET | `/batches/:id/qr` | Get QR code image | Any |

## Verification (Public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/verify/qr` | Verify by QR hash |
| GET | `/verify/batch/:id` | Verify by batch ID |

## Anomalies

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/anomalies` | List anomalies | Admin/Regulator |
| POST | `/anomalies` | Log anomaly | Any |
| PUT | `/anomalies/:id/resolve` | Resolve anomaly | Admin/Regulator |

## Authentication
All protected routes require:
```
Authorization: Bearer <jwt_token>
```
