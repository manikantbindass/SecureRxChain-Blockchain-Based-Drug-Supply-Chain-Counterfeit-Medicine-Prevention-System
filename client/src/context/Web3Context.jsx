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

    window.ethereum.on('accountsChanged', (accounts) => {
      setAccount(accounts[0] || null);
      if (!accounts[0]) setIsConnected(false);
    });
    window.ethereum.on('chainChanged', () => window.location.reload());
  }, []);

  const disconnect = () => {
    setProvider(null); setSigner(null); setAccount(null);
    setChainId(null); setIsConnected(false);
  };

  return (
    <Web3Context.Provider value={{ provider, signer, account, chainId, isConnected, connect, disconnect }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);
