const { ethers } = require('ethers');

let provider;
let signer;

const getProvider = () => {
  if (!provider) {
    provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  }
  return provider;
};

const getSigner = () => {
  if (!signer) {
    signer = new ethers.Wallet(process.env.PRIVATE_KEY, getProvider());
  }
  return signer;
};

const getContract = (address, abi) => {
  return new ethers.Contract(address, abi, getSigner());
};

module.exports = { getProvider, getSigner, getContract };
