<div align="center">

# 🏥 SecureRxChain

### **Blockchain-Based Drug Supply Chain & Counterfeit Medicine Prevention System**

[![CI/CD](https://github.com/manikantbindass/SecureRxChain-Blockchain-Based-Drug-Supply-Chain-Counterfeit-Medicine-Prevention-System/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/manikantbindass/SecureRxChain-Blockchain-Based-Drug-Supply-Chain-Counterfeit-Medicine-Prevention-System/actions/workflows/ci-cd.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blue)](https://soliditylang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3.11-blue)](https://www.python.org/)

*A decentralized platform that leverages blockchain technology, QR verification, and AI-powered anomaly detection to ensure end-to-end pharmaceutical traceability, prevent counterfeit medicines, and enforce regulatory compliance.*

[🚀 Demo](#demo) •
[📖 Documentation](#documentation) •
[🏗️ Architecture](#architecture) •
[⚡ Quick Start](#quick-start) •
[🤝 Contributing](#contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Problem Statement](#problem-statement)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Smart Contract Deployment](#smart-contract-deployment)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [AI Service Setup](#ai-service-setup)
- [API Documentation](#api-documentation)
- [Demo Workflow](#demo-workflow)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## 🎯 Overview

**SecureRxChain** is an enterprise-grade blockchain platform designed to combat the $200+ billion global counterfeit drug industry. By creating an immutable, transparent supply chain from manufacturer to consumer, we ensure that every pill can be verified, every transfer tracked, and every stakeholder held accountable.

### 🌟 Key Highlights

- ✅ **End-to-End Traceability**: Track drugs from manufacturing to consumer delivery
- ✅ **Blockchain Immutability**: Tamper-proof records on Ethereum/Polygon
- ✅ **QR Code Verification**: Instant authenticity checks via mobile app
- ✅ **AI Anomaly Detection**: Machine learning identifies suspicious patterns
- ✅ **Multi-Stakeholder**: Supports manufacturers, distributors, pharmacies, regulators, and consumers
- ✅ **Real-Time Analytics**: Dashboard insights for all participants
- ✅ **Regulatory Compliance**: Built-in audit trails and compliance reporting

---

## 🔥 Key Features

### 🔒 Blockchain Core
- **Smart Contracts**: Solidity-based contracts for drug registration, transfers, and verification
- **Ethereum/Polygon Network**: Low-cost, high-throughput transactions
- **IPFS Integration**: Decentralized storage for documents and batch data
- **Multi-Signature Wallets**: Enhanced security for critical operations

### 📱 Consumer Protection
- **QR Code Scanning**: Verify drug authenticity in seconds
- **Supply Chain Visibility**: View complete drug journey
- **Counterfeit Alerts**: Real-time notifications for suspicious drugs
- **Batch Recall System**: Instant alerts for recalled medications

### 🤖 AI-Powered Security
- **Anomaly Detection**: Isolation Forest ML model identifies unusual patterns
- **Risk Prediction**: Logistic Regression predicts counterfeit probability
- **Real-Time Monitoring**: Continuous analysis of supply chain activities
- **Fraud Prevention**: Automated flagging of suspicious transfers

### 👥 Role-Based Access
- **Manufacturers**: Register drugs, create batches, initiate transfers
- **Distributors**: Receive inventory, manage logistics, transfer to pharmacies
- **Pharmacies**: Dispense to consumers, update stock levels
- **Regulators**: Audit trails, compliance monitoring, recall management
- **Consumers**: Verify authenticity, report issues, track purchases

---

## ❗ Problem Statement

The pharmaceutical industry faces critical challenges:

| Problem | Impact | SecureRxChain Solution |
|---------|--------|------------------------|
| **Counterfeit Drugs** | $200B+ global market, 1M+ deaths/year | Blockchain verification + QR codes |
| **Supply Chain Opacity** | Impossible to trace drug origins | End-to-end transparent ledger |
| **Regulatory Compliance** | Manual audits, prone to errors | Automated audit trails |
| **Consumer Trust** | No way to verify authenticity | Instant mobile verification |
| **Recall Inefficiency** | Slow, incomplete drug recalls | Real-time alert system |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         PRESENTATION LAYER                       │
├──────────────┬───────────────┬──────────────┬───────────────────┤
│  React Web   │  Mobile App   │  Admin Panel │  Consumer Portal  │
│  Dashboard   │   (QR Scan)   │   (Regulator)│   (Verification)  │
└──────┬───────┴───────┬───────┴──────┬───────┴────────┬──────────┘
       │               │              │                │
       └───────────────┴──────────────┴────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                       APPLICATION LAYER                          │
├──────────────┬────────────────┬──────────────┬──────────────────┤
│  Node.js/    │  Flask API     │  GraphQL     │  WebSocket       │
│  Express API │  (AI Service)  │  (Optional)  │  (Real-time)     │
└──────┬───────┴────────┬───────┴──────┬───────┴────────┬─────────┘
       │                │              │                │
       └────────────────┴──────────────┴────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BUSINESS LOGIC                            │
├──────────────┬────────────────┬──────────────┬──────────────────┤
│  Drug        │  Transfer      │  Verification│  Analytics       │
│  Management  │  Controller    │  Service     │  Engine          │
└──────┬───────┴────────┬───────┴──────┬───────┴────────┬─────────┘
       │                │              │                │
       └────────────────┴──────────────┴────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                               │
├──────────────┬────────────────┬──────────────┬──────────────────┤
│  MongoDB     │  Ethereum/     │  IPFS        │  Redis Cache     │
│  (Off-chain) │  Polygon       │  (Documents) │  (Session)       │
│              │  (On-chain)    │              │                  │
└──────────────┴────────────────┴──────────────┴──────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AI/ML SERVICES                              │
├──────────────┬────────────────┬──────────────────────────────────┤
│  Anomaly     │  Risk          │  Predictive                      │
│  Detection   │  Prediction    │  Analytics                       │
│  (Isolation  │  (Logistic     │  (Future)                        │
│  Forest)     │  Regression)   │                                  │
└──────────────┴────────────────┴──────────────────────────────────┘
```

### Data Flow

1. **Drug Registration**: Manufacturer → Smart Contract → Blockchain + MongoDB
2. **Transfer**: Sender → Smart Contract → Blockchain (immutable record)
3. **Verification**: Consumer → QR Scan → API → Blockchain Query → Result
4. **AI Analysis**: Transfer Event → AI Service → Anomaly Score → Alert System

---
