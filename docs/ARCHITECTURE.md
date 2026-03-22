# SecureRxChain Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│   Vite + React + MUI Premium Glassmorphism + QR Scanner         │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP REST Requests
┌────────────────────────▼────────────────────────────────────────┐
│                       SERVER LAYER                              │
│   Node.js + Express (Port 5000) + JWT Auth + Axios              │
└──────────┬──────────────────────────────┬───────────────┬───────┘
           │ MongoDB                      │ ethers.js     │ Axios
┌──────────▼──────┐            ┌──────────▼───────────┐   │ HTTP POST
│   MongoDB Local │            │  BLOCKCHAIN LAYER    │   │
│   (Off-chain DB)│            │  Hardhat Local Node  │   │
└─────────────────┘            │  ┌─────────────────┐ │   │
                               │  │ DrugRegistry.sol│ │   │
                               │  └─────────────────┘ │   │
                               └──────────────────────┘   │
                                                  ┌───────▼───────────┐
                                                  │ AI MICROSERVICE   │
                                                  │ Python + Flask    │
                                                  │ (Port 5002)       │
                                                  └───────────────────┘
```

## Data Flow

### Drug Batch Creation
1. **Manufacturer** fills out the premium styled batch creation form.
2. The Frontend POSTs data to `/api/drugs/register`.
3. The Backend calls `DrugRegistry.registerDrug()` writing the lifecycle origin to the Smart Contract.
4. Transaction is confirmed on the **Local Hardhat Network**.
5. The Backend records secondary metadata (descriptions, images) off-chain into **MongoDB**.
6. A base64 QR code mapped exactly to the Frontend's `/verify/:batchId` route is generated and returned to the UI.

### Drug Verification & AI Risk Analysis (Consumer)
1. **Consumer** scans physical QR code utilizing the `html5-qrcode` integration on the `/qrscanner` route.
2. The App routes directly to `/verify/:id`.
3. The Backend invokes `DrugRegistry.verifyDrug(batchId)` catching immutable transit logs and authenticity states.
4. **AI Trigger:** The Backend aggregates transit hop counts, timestamps, and age, then POSTs these features to `http://localhost:5002/predict-risk`.
5. The **Python Machine Learning Engine** infers a Counterfeit Risk Score (0-100) using a Logistic Regression model trained to flag anomalies.
6. The compiled package (Blockchain Validity + MongoDB Metadata + AI Risk Score) is piped flawlessly back to the Consumer dashboard.

## Smart Contract Architecture

| Contract | Role |
|----------|------|
| `DrugRegistry` | Immutable core lifecycle ledger — governs secure asset minting, transfers to distributors, and final retail sales endpoints. |

## Security & Reliability Design
- **Key Storage:** Users retain decentralized isolation.
- **Identity:** JWT tokens passed seamlessly across HTTP headers securely track state authentication.
- **Microservices Routing:** Separating Machine Learning logic into a distinct Python container assures that blocking statistical operations never crash synchronous Node.js thread handlers.
- **Aesthetic Priority:** Highly engaging Glassmorphic interface constructed using Material UI prevents operator fatigue and guarantees visibility of critical anomalous alerts.
