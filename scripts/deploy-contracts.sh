#!/bin/bash
# Deploy contracts to specified network
NETWORK=${1:-localhost}
echo "🚀 Deploying SecureRxChain contracts to: $NETWORK"
cd blockchain
npx hardhat run scripts/deploy.js --network $NETWORK
echo "✅ Deployment complete. Check blockchain/deployments/$NETWORK.json"
