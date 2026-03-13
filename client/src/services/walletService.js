// client/src/services/walletService.js
// Blockchain wallet connect via ethers.js v6 + MetaMask

import { BrowserProvider } from 'ethers';

const walletService = {
  // Check if MetaMask is installed
  isMetaMaskInstalled: () => typeof window.ethereum !== 'undefined',

  // Connect wallet - returns { provider, signer, address, chainId }
  connectWallet: async () => {
    if (!walletService.isMetaMaskInstalled()) {
      throw new Error('MetaMask not installed. Please install MetaMask to continue.');
    }
    const provider = new BrowserProvider(window.ethereum);
    await provider.send('eth_requestAccounts', []);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const network = await provider.getNetwork();
    return { provider, signer, address, chainId: network.chainId.toString() };
  },

  // Get current connected accounts without prompt
  getAccounts: async () => {
    if (!walletService.isMetaMaskInstalled()) return [];
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    return accounts;
  },

  // Disconnect (MetaMask doesn't have a true disconnect, clear state)
  disconnectWallet: () => {
    return Promise.resolve(true);
  },

  // Switch to Polygon Mumbai Testnet
  switchToMumbai: async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x13881' }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x13881',
            chainName: 'Mumbai Testnet',
            nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
            rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
            blockExplorerUrls: ['https://mumbai.polygonscan.com/'],
          }],
        });
      } else throw switchError;
    }
  },

  // Sign message to prove wallet ownership
  signMessage: async (signer, message) => {
    return signer.signMessage(message);
  },

  // Listen to account changes
  onAccountChange: (callback) => {
    if (walletService.isMetaMaskInstalled()) {
      window.ethereum.on('accountsChanged', callback);
    }
  },

  // Listen to chain changes
  onChainChange: (callback) => {
    if (walletService.isMetaMaskInstalled()) {
      window.ethereum.on('chainChanged', callback);
    }
  },

  // Get ETH balance
  getBalance: async (provider, address) => {
    const balance = await provider.getBalance(address);
    return balance.toString();
  },

  // Format address short
  formatAddress: (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  },
};

export default walletService;
