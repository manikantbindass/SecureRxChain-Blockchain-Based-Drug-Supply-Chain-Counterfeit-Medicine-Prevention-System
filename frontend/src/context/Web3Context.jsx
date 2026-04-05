import React, { createContext, useState, useEffect, useCallback } from 'react';
import { BrowserProvider, Contract, formatUnits } from 'ethers';
import DrugRegistryArtifact from '../contracts/DrugRegistry.json';

export const Web3Context = createContext();

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState('');
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [error, setError] = useState('');
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);

  // Initialize Web3
  const initWeb3 = useCallback(async () => {
    if (window.ethereum) {
      setIsMetaMaskInstalled(true);
      try {
        const browserProvider = new BrowserProvider(window.ethereum);
        setProvider(browserProvider);

        const accounts = await browserProvider.listAccounts();
        if (accounts.length > 0) {
          setAccount(accounts[0].address);
          
          const signer = await browserProvider.getSigner();
          const contractInstance = new Contract(
            contractAddress,
            DrugRegistryArtifact.abi,
            signer
          );
          setContract(contractInstance);
        }

        // Listen for account changes
        window.ethereum.on('accountsChanged', async (newAccounts) => {
          if (newAccounts.length > 0) {
            setAccount(newAccounts[0]);
            const newSigner = await browserProvider.getSigner();
            const newContract = new Contract(
              contractAddress,
              DrugRegistryArtifact.abi,
              newSigner
            );
            setContract(newContract);
          } else {
            setAccount('');
            setContract(null);
          }
        });

      } catch (err) {
        console.error("Web3 Initialization Error:", err);
        setError("Failed to initialize Web3. Please check MetaMask.");
      }
    } else {
      setIsMetaMaskInstalled(false);
      setError("Please install MetaMask to use blockchain features.");
    }
  }, []);

  useEffect(() => {
    initWeb3();
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
      }
    };
  }, [initWeb3]);

  // Connect Wallet
  const connectWallet = async () => {
    if (!window.ethereum) {
      setError("Please install MetaMask first!");
      return;
    }
    try {
      setError('');
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      await initWeb3();
    } catch (err) {
      console.error(err);
      setError("User rejected the connection request.");
    }
  };

  return (
    <Web3Context.Provider
      value={{
        account,
        provider,
        contract,
        connectWallet,
        error,
        isMetaMaskInstalled,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
