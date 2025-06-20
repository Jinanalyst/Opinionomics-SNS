import { useState, useEffect } from 'react';
import { SolanaState } from '../types';
import { connectSolanaWallet } from '../utils/solana';

export const useSolana = () => {
  const [solanaState, setSolanaState] = useState<SolanaState>({
    isConnected: false
  });

  useEffect(() => {
    // Check if wallet was previously connected
    const checkConnection = async () => {
      if (window.solana && window.solana.isPhantom) {
        try {
          // Check if already connected
          const response = await window.solana.connect({ onlyIfTrusted: true });
          if (response) {
            const result = await connectSolanaWallet();
            if (result) {
              setSolanaState({
                isConnected: true,
                ...result
              });
            }
          }
        } catch (error) {
          // User hasn't connected before or rejected connection
          console.log('Wallet not previously connected');
        }
      }
    };

    checkConnection();

    // Listen for account changes
    if (window.solana) {
      const handleAccountChanged = (publicKey: any) => {
        if (publicKey) {
          checkConnection();
        } else {
          setSolanaState({ isConnected: false });
        }
      };

      window.solana.on('accountChanged', handleAccountChanged);

      return () => {
        window.solana?.removeListener('accountChanged', handleAccountChanged);
      };
    }
  }, []);

  const connect = async () => {
    const result = await connectSolanaWallet();
    if (result) {
      setSolanaState({
        isConnected: true,
        ...result
      });
    }
    return result;
  };

  const disconnect = async () => {
    if (window.solana) {
      await window.solana.disconnect();
    }
    setSolanaState({ isConnected: false });
  };

  return {
    solanaState,
    connect,
    disconnect,
    setSolanaState
  };
};