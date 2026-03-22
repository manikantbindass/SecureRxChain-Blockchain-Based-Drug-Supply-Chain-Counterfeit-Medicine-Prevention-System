# Project Architecture Details

This folder contains advanced architectural philosophies governing the SecureRxChain ecosystem. For an immediate overview and ASCII diagram of the data flow, please visit `/docs/ARCHITECTURE.md` in the root documentation directory.

## Design Principles

### Decentralization
No single point of control or failure governs the ledger. Smart Contracts establish an immutable chain.

### Scalability
The architecture is inherently modular:
- High-compute statistics are completely deferred to the **Python ML/AI Container**.
- Standard Web3 integrations are safely cached and executed by the **Node.js Express Controller**.
- Heavy static UI assets are served aggressively through **Vite**.

### Immutability
All critical transactions (`Create`, `Transfer`, `Sell`) are mapped directly onto the Blockchain framework.

## True Technology Stack

Unlike legacy documentations that planned for Hyperledger Fabric, the finalized operational stack utilizes the extreme efficiency of EVM ecosystems:

- **Blockchain Engine**: Solidity (Hardhat Local Node / EVM sidechains like Polygon).
- **Web3 Interfaces**: Ethers.js v6.
- **Backend API Layer**: Node.js, Express, Axios.
- **Machine Learning**: Python 3, Flask, Scikit-Learn.
- **Frontend**: React 18, Vite, Material UI v5.
- **Database**: Local or Cloud MongoDB (For lightweight off-chain metadata caching).

## Current Status

**Status**: Actively Deployed in Development Mode.

All architectural pillars exist harmoniously. The Smart Contract, Node Server, Python Engine, and React Server all inter-communicate seamlessly via REST APIs and Web3 JSON-RPC endpoints.
