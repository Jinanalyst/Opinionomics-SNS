import { ethers } from 'ethers';

// Web3 utility functions
export const connectWallet = async (): Promise<{
  address: string;
  ensName?: string;
  chainId: number;
  balance: string;
} | null> => {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask not found');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send('eth_requestAccounts', []);
    
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const balance = await provider.getBalance(address);
    const network = await provider.getNetwork();
    
    // Try to resolve ENS name
    let ensName: string | undefined;
    try {
      ensName = await provider.lookupAddress(address) || undefined;
    } catch (e) {
      // ENS resolution failed, continue without it
    }

    return {
      address,
      ensName,
      chainId: Number(network.chainId),
      balance: ethers.formatEther(balance)
    };
  } catch (error) {
    console.error('Failed to connect wallet:', error);
    return null;
  }
};

export const signMessage = async (message: string): Promise<string | null> => {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask not found');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const signature = await signer.signMessage(message);
    
    return signature;
  } catch (error) {
    console.error('Failed to sign message:', error);
    return null;
  }
};

export const verifySignature = (message: string, signature: string, address: string): boolean => {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === address.toLowerCase();
  } catch (error) {
    console.error('Failed to verify signature:', error);
    return false;
  }
};

export const shortenAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const getExplorerUrl = (txHash: string, chainId: number): string => {
  const explorers: Record<number, string> = {
    1: 'https://etherscan.io',
    5: 'https://goerli.etherscan.io',
    137: 'https://polygonscan.com',
    80001: 'https://mumbai.polygonscan.com'
  };
  
  const baseUrl = explorers[chainId] || 'https://etherscan.io';
  return `${baseUrl}/tx/${txHash}`;
};

// Declare global ethereum object
declare global {
  interface Window {
    ethereum?: any;
  }
}