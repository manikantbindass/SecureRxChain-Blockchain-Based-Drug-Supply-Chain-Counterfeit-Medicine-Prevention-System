# API Subsystem Documentation

This folder details the overarching REST API architecture designed for the SecureRxChain platform. Specific endpoint schemas are continuously maintained in the root `docs/API.md` file.

## Purpose

Provides detailed routing architectures for the backend API, enabling the React frontend to natively interface with the Blockchain layer without exposing Smart Contract private keys directly to user-space.

## Core API Philosophy

### Gateway Architecture
The Node.js Express Backend serves as a protected gateway:
1. Validates inbound credentials via JWT.
2. Formats external payloads into Ethers.js-compatible contract calls.
3. Proxies analytic features directly to the separate Python AI Microservice network.

### Security
- **JWT Authentication** on all Manufacturer and Pharmacy restricted endpoints.
- **CORS Mitigation:** Protected via explicit origin bindings for the Vite Dev Server (Port 5173 / Production Domains).
- **Environment Isolation:** Smart Contract ABIs and target Addresses are injected safely through local server configurations.

## Sub-System Routing Modifiers

### 1. The Authentication Controller (`/auth`)
Manages JWT issuance and MongoDB off-chain user verification.
- Validates user roles natively before pinging the Ethereum Virtual Machine.

### 2. The Drug Verification Controller (`/drugs`)
The core functionality gateway interfacing exactly with the Solidity `DrugRegistry`.
- Handles `register`, `transfer`, `sell`.
- The `/verify/:batchId` route is highly unique: it chains a Smart Contract query natively to an internal Axios POST request to `127.0.0.1:5002` (The Python AI Engine), returning a deeply nested validation JSON to the Consumer UI.

## Current Status
**Status:** Active & Deployed. 

All routing correctly encapsulates the Web3 architecture and runs flawlessly on default Port `5000`.
