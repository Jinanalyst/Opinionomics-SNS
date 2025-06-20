import { useState, useEffect } from 'react';
import { Web3State } from '../types';
import { connectWallet } from '../utils/web3';

export const useWeb3 = () => {
  const [web3State, setWeb3State] = useState<Web3State>({
    isConnected: false
  });

  useEffect(() => {
    // Check if wallet was previously connected
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            const result = await connectWallet();
            if (result) {
              setWeb3State({
                isConnected: true,
                ...result
              });
            }
          }
        } catch (error) {
          console.error('Failed to check wallet connection:', error);
        }
      }
    };

    checkConnection();

    // Listen for account changes
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          setWeb3State({ isConnected: false });
        } else {
          checkConnection();
        }
      };

      const handleChainChanged = () => {
        checkConnection();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const connect = async () => {
    const result = await connectWallet();
    if (result) {
      setWeb3State({
        isConnected: true,
        ...result
      });
    }
    return result;
  };

  const disconnect = () => {
    setWeb3State({ isConnected: false });
  };

  return {
    web3State,
    connect,
    disconnect,
    setWeb3State
  };
};