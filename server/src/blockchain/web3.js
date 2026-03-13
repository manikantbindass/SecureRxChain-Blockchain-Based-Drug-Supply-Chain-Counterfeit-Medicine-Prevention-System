const { ethers } = require('ethers');
const contracts = require('../config/contracts');
const logger = require('../utils/logger');

let provider = null;
let signer = null;
let contractInstances = {};

const initializeWeb3 = () => {
  try {
    provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'http://127.0.0.1:8545');

    if (process.env.SERVER_PRIVATE_KEY) {
      signer = new ethers.Wallet(process.env.SERVER_PRIVATE_KEY, provider);
    }

    const { deployments } = contracts;

    if (deployments.AccessControl && contracts.AccessControlABI.length > 0) {
      contractInstances.accessControl = new ethers.Contract(
        deployments.AccessControl,
        contracts.AccessControlABI,
        signer || provider
      );
    }

    if (deployments.DrugRegistry && contracts.DrugRegistryABI.length > 0) {
      contractInstances.drugRegistry = new ethers.Contract(
        deployments.DrugRegistry,
        contracts.DrugRegistryABI,
        signer || provider
      );
    }

    if (deployments.SupplyChain && contracts.SupplyChainABI.length > 0) {
      contractInstances.supplyChain = new ethers.Contract(
        deployments.SupplyChain,
        contracts.SupplyChainABI,
        signer || provider
      );
    }

    if (deployments.Verification && contracts.VerificationABI.length > 0) {
      contractInstances.verification = new ethers.Contract(
        deployments.Verification,
        contracts.VerificationABI,
        provider
      );
    }

    logger.info('Web3 provider and contracts initialized');
    return { provider, signer, ...contractInstances };
  } catch (error) {
    logger.error('Web3 initialization failed:', error.message);
    throw error;
  }
};

const getProvider = () => {
  if (!provider) initializeWeb3();
  return provider;
};

const getSigner = () => {
  if (!signer) initializeWeb3();
  return signer;
};

const getContract = (name) => {
  if (!contractInstances[name]) initializeWeb3();
  return contractInstances[name];
};

module.exports = {
  initializeWeb3,
  getProvider,
  getSigner,
  getContract,
  get accessControl() { return getContract('accessControl'); },
  get drugRegistry() { return getContract('drugRegistry'); },
  get supplyChain() { return getContract('supplyChain'); },
  get verification() { return getContract('verification'); },
};
