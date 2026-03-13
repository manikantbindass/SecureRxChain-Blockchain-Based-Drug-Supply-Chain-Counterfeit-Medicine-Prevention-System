const { getContract } = require('../config/blockchain');
const DrugRegistryABI = require('./DrugRegistryABI.json');

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

const getDrugContract = () => {
  return getContract(CONTRACT_ADDRESS, DrugRegistryABI);
};

const registerDrugOnChain = async (batchId, ipfsHash, expiryTimestamp) => {
  const contract = getDrugContract();
  const tx = await contract.registerDrug(batchId, ipfsHash, expiryTimestamp);
  const receipt = await tx.wait();
  return receipt;
};

const transferDrugOnChain = async (batchId, newOwnerAddress) => {
  const contract = getDrugContract();
  const tx = await contract.transferOwnership(batchId, newOwnerAddress);
  const receipt = await tx.wait();
  return receipt;
};

const quarantineDrugOnChain = async (batchId) => {
  const contract = getDrugContract();
  const tx = await contract.quarantineDrug(batchId);
  const receipt = await tx.wait();
  return receipt;
};

const getDrugFromChain = async (batchId) => {
  const contract = getDrugContract();
  return await contract.getDrug(batchId);
};

const getDrugHistoryFromChain = async (batchId) => {
  const contract = getDrugContract();
  return await contract.getTransferHistory(batchId);
};

module.exports = {
  registerDrugOnChain,
  transferDrugOnChain,
  quarantineDrugOnChain,
  getDrugFromChain,
  getDrugHistoryFromChain,
};
