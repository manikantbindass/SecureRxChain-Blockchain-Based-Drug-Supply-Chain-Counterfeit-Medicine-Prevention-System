# SecureRxChain - Complete Setup Guide

This guide provides step-by-step instructions to set up the SecureRxChain project locally.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Frontend Setup](#frontend-setup)
- [Backend Setup](#backend-setup)
- [Smart Contract Deployment](#smart-contract-deployment)
- [Running the Application](#running-the-application)

---

## Prerequisites

Ensure you have the following installed on your system:

- **Node.js** (v18.x or higher) - [Download](https://nodejs.org/)
- **npm** (v9.x or higher) - Comes with Node.js
- **Python** (v3.11 or higher) - [Download](https://www.python.org/)
- **Git** - [Download](https://git-scm.com/)
- **Ganache** (for local blockchain) - [Download](https://trufflesuite.com/ganache/)
- **Metamask** browser extension - [Install](https://metamask.io/)

### Verify Installation

```bash
node --version
npm --version
python --version
git --version
```

---

## Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/manikantbindass/SecureRxChain-Blockchain-Based-Drug-Supply-Chain-Counterfeit-Medicine-Prevention-System.git
```

### Step 2: Navigate to Project Directory

```bash
cd SecureRxChain-Blockchain-Based-Drug-Supply-Chain-Counterfeit-Medicine-Prevention-System
```

---

## Frontend Setup

### Step 1: Navigate to Frontend Directory

```bash
cd frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Create Environment File

Create a `.env` file in the `frontend` directory:

```bash
touch .env
```

Add the following variables:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_BLOCKCHAIN_NETWORK=http://localhost:7545
REACT_APP_CONTRACT_ADDRESS=YOUR_DEPLOYED_CONTRACT_ADDRESS
```

### Step 4: Start Development Server

```bash
npm start
```

The React app will be available at `http://localhost:3000`

---

## Backend Setup

### Step 1: Navigate to Backend Directory

```bash
cd ../backend/counterfeit-detection
```

### Step 2: Create Virtual Environment (Recommended)

```bash
python -m venv venv
```

### Step 3: Activate Virtual Environment

**On Windows:**
```bash
venv\Scripts\activate
```

**On macOS/Linux:**
```bash
source venv/bin/activate
```

### Step 4: Install Python Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### Step 5: Start Flask Server

```bash
python app.py
```

The API will be available at `http://localhost:5000`

---

## Smart Contract Deployment

### Step 1: Navigate to Blockchain Directory

```bash
cd ../../blockchain/contracts
```

### Step 2: Install Truffle Globally

```bash
npm install -g truffle
```

### Step 3: Compile Smart Contracts

```bash
truffle compile
```

### Step 4: Start Ganache

Launch Ganache GUI or CLI:

```bash
ganache-cli
```

### Step 5: Deploy Contracts

```bash
truffle migrate --network development
```

### Step 6: Note the Contract Address

After deployment, copy the contract address and update it in the frontend `.env` file.

---

## Running the Application

### Terminal 1: Start Ganache
```bash
ganache-cli
```

### Terminal 2: Run Backend Server
```bash
cd backend/counterfeit-detection
source venv/bin/activate  # or venv\Scripts\activate on Windows
python app.py
```

### Terminal 3: Run Frontend
```bash
cd frontend
npm start
```

---

## Quick Start Commands

For a quick setup, run these commands in sequence:

```bash
# Clone and navigate
git clone https://github.com/manikantbindass/SecureRxChain-Blockchain-Based-Drug-Supply-Chain-Counterfeit-Medicine-Prevention-System.git
cd SecureRxChain-Blockchain-Based-Drug-Supply-Chain-Counterfeit-Medicine-Prevention-System

# Frontend setup
cd frontend
npm install
cp .env.example .env  # Edit with your values

# Backend setup
cd ../backend/counterfeit-detection
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Blockchain setup
cd ../../blockchain
npm install -g truffle
truffle compile
truffle migrate

# Start all services
# Terminal 1: ganache-cli
# Terminal 2: cd backend/counterfeit-detection && python app.py
# Terminal 3: cd frontend && npm start
```

---

## Troubleshooting

### Common Issues

**Issue 1: Port Already in Use**
```bash
# Kill process on port 3000 (React)
lsof -ti:3000 | xargs kill

# Kill process on port 5000 (Flask)
lsof -ti:5000 | xargs kill
```

**Issue 2: Module Not Found**
```bash
# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install

# Backend
cd backend/counterfeit-detection
pip install -r requirements.txt --force-reinstall
```

**Issue 3: Blockchain Connection Failed**
- Ensure Ganache is running on `http://localhost:7545`
- Check MetaMask is connected to the correct network
- Verify contract address in `.env` file

---

## Additional Resources

- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [Truffle Documentation](https://trufflesuite.com/docs/truffle/)
- [Web3.js Documentation](https://web3js.readthedocs.io/)

---

## Support

For issues or questions, please:
1. Check the [Issues](https://github.com/manikantbindass/SecureRxChain-Blockchain-Based-Drug-Supply-Chain-Counterfeit-Medicine-Prevention-System/issues) page
2. Create a new issue with detailed information
3. Contact the maintainers

---

**Happy Coding! 🚀**
