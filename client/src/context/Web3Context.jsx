// client/src/context/Web3Context.jsx
// Wallet/Web3 context for MetaMask + ethers.js v6
import React, { createContext, useContext, useState, useCallback } from 'react';
import { ethers } from 'ethers';

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      alert('MetaMask not found. Please install MetaMask.');
      return;
    }
    const web3Provider = new ethers.BrowserProvider(window.ethereum);
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const web3Signer = await web3Provider.getSigner();
    const address = await web3Signer.getAddress();
    const network = await web3Provider.getNetwork();
    setProvider(web3Provider);
    setSigner(web3Signer);
    setAccount(address);
    setChainId(network.chainId.toString());
    setIsConnected(true);
    return { provider: web3Provider, signer: web3Signer, address, chainId: network.chainId.toString() };
  }, []);

  const disconnect = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setChainId(null);
    setIsConnected(false);
  }, []);

  // Listen for account/chain changes
  React.useEffect(() => {
    if (!window.ethereum) return;
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setAccount(accounts[0]);
      }
    };
    const handleChainChanged = (id) => {
      setChainId(parseInt(id, 16).toString());
    };
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [disconnect]);

  const value = { provider, signer, account, chainId, isConnected, connect, disconnect };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

export const useWeb3 = () => {
  const ctx = useContext(Web3Context);
  if (!ctx) throw new Error('useWeb3 must be used within Web3Provider');
  return ctx;
};

// Aliases for backward compatibility
export const WalletProvider = Web3Provider;
export const useWallet = useWeb3;

export default Web3Context;
