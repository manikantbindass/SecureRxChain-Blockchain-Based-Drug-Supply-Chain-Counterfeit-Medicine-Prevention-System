# Deployment Documentation

Guidelines for running and maintaining the decentralized SecureRxChain environment.

## Overview

The platform is cleanly separated into four discrete microservices. Refer to the root `README.md` for specific execution environments.

1. **The Web3 Node**: Hardhat (e.g., `npx hardhat node` & `npx hardhat run scripts/deploy.js`). Expected to bind to Port 8545.
2. **The Express Backend**: Node.js pipeline proxy. Maps Mongo clusters to Web3 endpoints. Expected to bind to Port 5000.
3. **The AI Inference Pipeline**: Flask + Scikit-Learn logic. Runs statically off of the `risk_api.py` architecture. Expected to bind to Port 5002.
4. **The Client Terminal**: Vite + React execution. Proxies UI actions directly to `5000`. Expected to bind to Port 5173.

## Local Workflow Synchronization

To deploy fully on Localhost during development:
Ensure you instantiate `hardhat node` BEFORE deploying the server stack so the `.env` dependencies hook properly!

## CI/CD 

GitHub Actions natively intercepts pushes to the `main` branch to evaluate Smart Contract testnets and bundle the dist build.

## Current Status

**Status**: Active. Frontend deploys continuously to GitHub Pages. Local server execution verified completely.
