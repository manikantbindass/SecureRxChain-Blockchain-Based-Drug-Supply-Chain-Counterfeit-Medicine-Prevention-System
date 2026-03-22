const { ethers } = require('ethers');

// This requires Hardhat to be compiled first
const DrugRegistryArtifact = require('../../blockchain/artifacts/contracts/DrugRegistry.sol/DrugRegistry.json');

const getProvider = () => {
    return new ethers.JsonRpcProvider(process.env.HARDHAT_RPC || 'http://127.0.0.1:8545');
};

const getAdminContract = () => {
    const provider = getProvider();
    const wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);
    return new ethers.Contract(process.env.CONTRACT_ADDRESS, DrugRegistryArtifact.abi, wallet);
};

const getUserContract = (privateKey) => {
    const provider = getProvider();
    const wallet = new ethers.Wallet(privateKey, provider);
    return new ethers.Contract(process.env.CONTRACT_ADDRESS, DrugRegistryArtifact.abi, wallet);
};

const getReadOnlyContract = () => {
    const provider = getProvider();
    return new ethers.Contract(process.env.CONTRACT_ADDRESS, DrugRegistryArtifact.abi, provider);
}

module.exports = {
  getProvider,
  getAdminContract,
  getUserContract,
  getReadOnlyContract,
  abi: DrugRegistryArtifact.abi
};
