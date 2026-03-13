const path = require('path');
const fs = require('fs');

const loadABI = (contractName) => {
  const artifactPath = path.join(
    __dirname,
    '../../../blockchain/artifacts/contracts',
    `${contractName}.sol`,
    `${contractName}.json`
  );

  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    return artifact.abi;
  }

  // Fallback minimal ABIs for development
  return [];
};

const loadDeployments = () => {
  const deploymentPath = path.join(
    __dirname,
    '../../../blockchain/deployments/localhost.json'
  );

  if (fs.existsSync(deploymentPath)) {
    return JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  }

  return {
    AccessControl: process.env.ACCESS_CONTROL_ADDRESS || '',
    DrugRegistry: process.env.DRUG_REGISTRY_ADDRESS || '',
    SupplyChain: process.env.SUPPLY_CHAIN_ADDRESS || '',
    Verification: process.env.VERIFICATION_ADDRESS || '',
  };
};

module.exports = {
  AccessControlABI: loadABI('SecureRxAccessControl'),
  DrugRegistryABI: loadABI('DrugRegistry'),
  SupplyChainABI: loadABI('SupplyChain'),
  VerificationABI: loadABI('Verification'),
  deployments: loadDeployments(),
};
