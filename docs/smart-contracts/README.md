# Smart Contract (EVM) Documentation

This folder documents the design and actual implementation of the Solidity smart contracts running the core of SecureRxChain.

## Complete Monopoly Over Supply Chain Truth

We discarded complex hyperledger setups for pure, unadulterated execution speed on the Ethereum Virtual Machine (EVM) ecosystem.

## `DrugRegistry.sol`
**Purpose**: Primary Singleton orchestrating Batch Creation and Distribution. 

### Key Modifiers & State Vectors
- Utilizes `Roles` mappings ensuring ONLY Whitelisted accounts act as "Manufacturers" or "Distributors".
- Every drug batch maintains strict mapping structs encoding:
  - `string name`
  - `string description`
  - `address manufacturer`
  - `address currentHolder`
  - `uint256 manufactureDate`

### Immutable Function Pipelines:

**1. `registerBatch(string name, string memory description)`**
Generates a unique cryptographic `bytes32 batchId` hashing the current `block.timestamp` and block statistics. Secures custody to `msg.sender`.

**2. `transferBatch(bytes32 batchId, address newOwner)`**
Checks if `msg.sender` is the active `currentHolder`. Revokes previous ownership, pushing the timestamp to the `transferHistory` array permanently recording the jump.

**3. `sellBatch(bytes32 batchId)`**
Once flagged as 'Sold' via Pharmacy nodes, the Smart Contract strictly `reverts` any future transfer attempts. Ensures counterfeit duplications are instantly caught because the token is dead.

**4. `getBatchHistory(bytes32 batchId)`**
Aggregates all transit locations, returned flawlessly to the Node.js indexer to append with AI Risk inference logs!

## Security 

- Entirely stateless contract design.
- Strictly guards execution via mapping-verified ownership checks (`require(msg.sender == batch.currentHolder)`).
- Safe from basic re-entrancy looping.

## Current Status

**Status**: Active Production Ready. Compiled flawlessly across Hardhat environments.
