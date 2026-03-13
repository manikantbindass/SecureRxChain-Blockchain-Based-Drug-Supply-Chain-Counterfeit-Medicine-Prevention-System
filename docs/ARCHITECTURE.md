# SecureRxChain Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│   React + MUI + ethers.js + QR Scanner + MetaMask Wallet        │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP/REST + WebSocket
┌────────────────────────▼────────────────────────────────────────┐
│                       SERVER LAYER                              │
│   Node.js + Express + JWT Auth + MongoDB + IPFS + AI Module     │
└──────────┬──────────────────────────────┬───────────────────────┘
           │ MongoDB                      │ ethers.js RPC
┌──────────▼──────┐            ┌──────────▼──────────────────────┐
│   MongoDB Atlas │            │        BLOCKCHAIN LAYER          │
│   (Off-chain DB)│            │  Polygon Mumbai / Hardhat Local  │
└─────────────────┘            │  ┌─────────────────────────────┐│
                               │  │ RoleManager.sol             ││
                               │  │ DrugRegistry.sol            ││
                               │  │ QRVerifier.sol              ││
                               │  │ AnomalyLogger.sol           ││
                               │  └─────────────────────────────┘│
                               └─────────────────────────────────┘
```

## Data Flow

### Drug Batch Creation
1. Manufacturer fills batch form (React)
2. Documents uploaded to IPFS → CID returned
3. QR hash computed from batch metadata
4. Backend calls `DrugRegistry.createBatch()` with IPFS CID + QR hash
5. Transaction confirmed on Polygon
6. MongoDB record created with txHash
7. QR code image generated and returned to manufacturer

### Drug Verification (Consumer)
1. Consumer scans QR code via `html5-qrcode`
2. App extracts batchId + qrHash from QR payload
3. Backend calls `DrugRegistry.verifyBatch(batchId, qrHash)`
4. Smart contract returns: isAuthentic, status, isExpired
5. Result displayed to consumer with full audit trail

## Smart Contract Architecture

| Contract | Role |
|----------|------|
| `RoleManager` | RBAC — grants/revokes roles on-chain |
| `DrugRegistry` | Core batch lifecycle (create, transfer, recall) |
| `QRVerifier` | Tamper-proof QR hash registry |
| `AnomalyLogger` | AI anomaly event immutable log |

## Security Design
- JWT tokens with short expiry + refresh token rotation
- bcrypt password hashing (12 rounds)
- Helmet.js HTTP header hardening
- Rate limiting on all API endpoints
- On-chain RBAC via OpenZeppelin AccessControl
- ReentrancyGuard on critical contract functions
- IPFS for immutable document storage
