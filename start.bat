@echo off
echo Starting SecureRxChain Local Environment...

echo [1/3] Starting Local Hardhat Blockchain...
start cmd /k "cd blockchain && npx hardhat node"

echo Wait for blockchain to start and deploy contracts...
timeout /t 5 /nobreak
cd blockchain
call npx hardhat run scripts/deploy.js --network localhost > deploy_out.txt
set /p CONTRACT_INFO=<deploy_out.txt
echo %CONTRACT_INFO%
cd ..

echo [2/3] Starting Backend API...
start cmd /k "cd backend && npm start"

echo [3/3] Starting Frontend Dashboard...
start cmd /k "cd frontend && npm run dev"

echo All services started!
