#!/bin/bash
# SecureRxChain — Full Local Setup Script
set -e

echo "🔗 SecureRxChain Setup"
echo "====================="

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found. Install from https://nodejs.org"
  exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Node.js 18+ required. Found: $(node -v)"
  exit 1
fi
echo "✅ Node.js $(node -v) found"

# Install root dependencies
echo "\n📦 Installing root dependencies..."
npm install

# Install blockchain dependencies
echo "\n⛓️  Installing blockchain dependencies..."
npm install --prefix blockchain

# Install server dependencies
echo "\n🖥️  Installing server dependencies..."
npm install --prefix server

# Install client dependencies
echo "\n⚛️  Installing client dependencies..."
npm install --prefix client

# Copy env files
echo "\n🔐 Setting up environment files..."
[ ! -f blockchain/.env ] && cp blockchain/.env.example blockchain/.env && echo "  Created blockchain/.env"
[ ! -f server/.env ] && cp server/.env.example server/.env && echo "  Created server/.env"
[ ! -f client/.env ] && cp client/.env.example client/.env && echo "  Created client/.env"

# Compile contracts
echo "\n🔨 Compiling smart contracts..."
cd blockchain && npx hardhat compile && cd ..

echo "\n🎉 Setup complete!"
echo "\n📋 Next steps:"
echo "  1. Edit .env files with your credentials"
echo "  2. Run: cd blockchain && npx hardhat node"
echo "  3. Run: cd blockchain && npx hardhat run scripts/deploy.js --network localhost"
echo "  4. Run: cd server && npm run dev"
echo "  5. Run: cd client && npm start"
