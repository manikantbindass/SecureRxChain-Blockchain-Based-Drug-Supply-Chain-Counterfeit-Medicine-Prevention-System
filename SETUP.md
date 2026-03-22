# SecureRxChain - Complete Setup Guide

This guide provides step-by-step instructions to set up the SecureRxChain project locally.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Blockchain Setup](#blockchain-setup)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Running the Application](#running-the-application)

---

## Prerequisites

Ensure you have the following installed on your system:

- **Node.js** (v18.x or higher) - [Download](https://nodejs.org/)
- **npm** (v9.x or higher) - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)
- **Metamask** browser extension (Optional for testing) - [Install](https://metamask.io/)

### Verify Installation

```bash
node --version
npm --version
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

## Blockchain Setup

The blockchain layer uses Hardhat for modern Ethereum development.

### Step 1: Navigate to Blockchain Directory

```bash
cd blockchain
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Start Node and Deploy

Open a terminal and start the Hardhat local node:
```bash
npx hardhat node
```

In a **second terminal** (inside the `blockchain` directory), deploy the contracts:
```bash
npx hardhat run scripts/deploy.js --network localhost
```

---

## Backend Setup

The backend is built with Node.js and Express.

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Setup Environment Variables

Copy the example environment file or create one:
```bash
cp .env.example .env
```
Ensure the `RPC_URL` is set to `http://127.0.0.1:8545` and that your Local MongoDB instance is running.

### Step 4: Start the Server

```bash
npm start
```
The API server will run securely on port `5000`.

---

## Frontend Setup

The frontend uses React and Vite for blazing-fast development.

### Step 1: Navigate to Frontend Directory

```bash
cd frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Start Development Server

```bash
npm run dev
```

The React app will be available at `http://localhost:5173`.

---

## Running the Application

To run the full stack simultaneously, open three terminal windows from the root directory:

### Terminal 1: Local Blockchain
```bash
cd blockchain
npx hardhat node
```

### Terminal 2: Node.js Backend API
```bash
cd backend
npm start
```

### Terminal 3: React Vite Frontend
```bash
cd frontend
npm run dev
```

---

## Troubleshooting

### Common Issues

**Issue 1: Port Already in Use**
```bash
# Windows
npx kill-port 5000
npx kill-port 5173
```

**Issue 2: Module Not Found**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Issue 3: Blockchain Connection Failed**
- Ensure Hardhat is running on `http://127.0.0.1:8545`
- Check MetaMask is connected to the correct localhost network.

---

**Happy Coding! 🚀**
