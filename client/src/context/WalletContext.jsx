// client/src/context/WalletContext.jsx
// Re-export from Web3Context for backward compatibility
export {
  Web3Provider as WalletProvider,
  useWeb3 as useWallet,
  default,
} from './Web3Context';

// Also export original names
export { Web3Provider, useWeb3 } from './Web3Context';
