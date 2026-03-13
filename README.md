# 🔗 SecureRxChain

> **Blockchain-Based Drug Supply Chain & Counterfeit Medicine Prevention System**

[![CI/CD](https://github.com/manikantbindass/SecureRxChain-Blockchain-Based-Drug-Supply-Chain-Counterfeit-Medicine-Prevention-System/actions/workflows/ci.yml/badge.svg)](https://github.com/manikantbindass/SecureRxChain-Blockchain-Based-Drug-Supply-Chain-Counterfeit-Medicine-Prevention-System/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blue)
![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![React](https://img.shields.io/badge/React-18.x-61DAFB)

---

## 📌 Overview

SecureRxChain is a **decentralized drug supply chain management platform** that leverages Ethereum blockchain (Polygon Testnet) to ensure pharmaceutical traceability, prevent counterfeit medicines, and enforce regulatory compliance.

### Key Features
- 🔒 **End-to-end batch traceability** — Manufacturer → Distributor → Retailer → Consumer
- 📲 **QR Code verification** — Each drug batch gets a unique, tamper-proof QR
- 🤖 **AI-based anomaly detection** — Flags suspicious supply chain activity
- 🌐 **IPFS document storage** — Regulatory documents stored decentrally
- 🔑 **Role-based access control** — JWT auth with on-chain role management
- 📊 **Transparency dashboard** — Real-time audit trail for all stakeholders

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Blockchain | Ethereum / Polygon Mumbai Testnet |
| Smart Contracts | Solidity 0.8.20 + Hardhat |
| Backend | Node.js + Express.js + MongoDB |
| Frontend | React 18 + Material UI v5 |
| Blockchain Bridge | ethers.js v6 |
| QR Code | qrcode + html5-qrcode |
| Auth | JWT + bcrypt |
| Storage | IPFS (via Web3.Storage / Pinata) |
| DevOps | Docker + GitHub Actions CI/CD |

---

## 📁 Project Structure

```
SecureRxChain/
├── client/                   # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Route-level pages
│   │   ├── context/          # React Context (auth, web3)
│   │   ├── hooks/            # Custom hooks
│   │   ├── services/         # API + contract service calls
│   │   ├── utils/            # Helpers (QR, IPFS, format)
│   │   └── App.jsx
│   ├── .env.example
│   └── package.json
├── server/                   # Node.js backend
│   ├── config/               # DB + env config
│   ├── controllers/          # Route controllers
│   ├── middleware/           # Auth, error handlers
│   ├── models/               # Mongoose models
│   ├── routes/               # Express routers
│   ├── services/             # Business logic, IPFS, AI
│   ├── utils/
│   ├── .env.example
│   └── package.json
├── blockchain/               # Hardhat project
│   ├── contracts/            # Solidity smart contracts
│   ├── scripts/              # Deploy scripts
│   ├── test/                 # Contract unit tests
│   ├── hardhat.config.js
│   └── package.json
├── scripts/                  # Shell utility scripts
├── docker/                   # Dockerfiles per service
├── docs/                     # Architecture diagrams, API docs
├── .github/workflows/        # CI/CD pipelines
├── docker-compose.yml
└── README.md
```

---

## 🚀 Quick Start (Local)

### Prerequisites
- Node.js >= 18
- Docker & Docker Compose
- MetaMask wallet
- MongoDB (local or Atlas)
- Pinata / Web3.Storage API key

### 1. Clone & Install

```bash
git clone https://github.com/manikantbindass/SecureRxChain-Blockchain-Based-Drug-Supply-Chain-Counterfeit-Medicine-Prevention-System.git
cd SecureRxChain-Blockchain-Based-Drug-Supply-Chain-Counterfeit-Medicine-Prevention-System

# Install all dependencies
npm run install:all
```

### 2. Environment Variables

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
cp blockchain/.env.example blockchain/.env
# Fill in your values
```

### 3. Compile & Deploy Smart Contracts

```bash
cd blockchain
npx hardhat compile
npx hardhat run scripts/deploy.js --network localhost
# Or for Polygon Mumbai:
npx hardhat run scripts/deploy.js --network mumbai
```

### 4. Run with Docker Compose

```bash
docker-compose up --build
```

### 5. Run Manually

```bash
# Terminal 1 – Backend
cd server && npm run dev

# Terminal 2 – Frontend
cd client && npm start

# Terminal 3 – Local Hardhat node
cd blockchain && npx hardhat node
```

Access:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Hardhat node: http://localhost:8545

---

## 🔐 Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Register manufacturers, manage system |
| **Manufacturer** | Create & mint drug batches |
| **Distributor** | Accept & transfer batches |
| **Retailer** | Receive and sell batches |
| **Consumer** | Verify drug authenticity via QR |

---

## 📜 Smart Contracts

| Contract | Description |
|----------|-------------|
| `DrugRegistry.sol` | Core batch lifecycle management |
| `RoleManager.sol` | On-chain RBAC |
| `QRVerifier.sol` | Hash-based QR authentication |
| `AnomalyLogger.sol` | AI anomaly event logging |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'feat: add your feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

MIT © [Manikant Bindass](https://github.com/manikantbindass)
