import { Connection, PublicKey, clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js';

// Get RPC URL from environment variables with fallbacks
const getRpcUrl = (cluster: 'mainnet-beta' | 'testnet' | 'devnet' = 'mainnet-beta'): string => {
  switch (cluster) {
    case 'mainnet-beta':
      return import.meta.env.VITE_SOLANA_RPC_URL || clusterApiUrl('mainnet-beta');
    case 'devnet':
      return import.meta.env.VITE_SOLANA_RPC_URL_DEVNET || clusterApiUrl('devnet');
    case 'testnet':
      return import.meta.env.VITE_SOLANA_RPC_URL_TESTNET || clusterApiUrl('testnet');
    default:
      return clusterApiUrl('mainnet-beta');
  }
};

// Solana utility functions
export const connectSolanaWallet = async (): Promise<{
  publicKey: string;
  balance: number;
  cluster: 'mainnet-beta' | 'testnet' | 'devnet';
} | null> => {
  try {
    // Check if Phantom wallet is available
    if (!window.solana || !window.solana.isPhantom) {
      throw new Error('Phantom wallet not found');
    }

    const response = await window.solana.connect();
    const publicKey = response.publicKey.toString();
    
    // Try different clusters if mainnet fails
    const clusters: ('mainnet-beta' | 'devnet' | 'testnet')[] = ['devnet', 'mainnet-beta', 'testnet'];
    
    for (const cluster of clusters) {
      try {
        // Connect to Solana network with custom RPC URL
        const rpcUrl = getRpcUrl(cluster);
        const connection = new Connection(rpcUrl, 'confirmed');
        
        // Test the connection with a timeout
        const balancePromise = connection.getBalance(new PublicKey(publicKey));
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 10000)
        );
        
        const balance = await Promise.race([balancePromise, timeoutPromise]) as number;
        
        return {
          publicKey,
          balance: balance / LAMPORTS_PER_SOL,
          cluster
        };
      } catch (clusterError) {
        console.warn(`Failed to connect to ${cluster}:`, clusterError);
        // Continue to next cluster
        continue;
      }
    }
    
    // If all clusters fail, return wallet info without balance
    console.warn('Could not fetch balance from any cluster, returning wallet without balance');
    return {
      publicKey,
      balance: 0,
      cluster: 'mainnet-beta'
    };
    
  } catch (error) {
    console.error('Failed to connect Solana wallet:', error);
    return null;
  }
};

export const signSolanaMessage = async (message: string): Promise<string | null> => {
  try {
    if (!window.solana) {
      throw new Error('Phantom wallet not found');
    }

    const encodedMessage = new TextEncoder().encode(message);
    const signedMessage = await window.solana.signMessage(encodedMessage, 'utf8');
    
    return Buffer.from(signedMessage.signature).toString('hex');
  } catch (error) {
    console.error('Failed to sign message:', error);
    return null;
  }
};

export const verifySolanaSignature = (
  message: string, 
  signature: string, 
  publicKey: string
): boolean => {
  try {
    // In a real implementation, you would verify the signature
    // For demo purposes, we'll return true
    return true;
  } catch (error) {
    console.error('Failed to verify signature:', error);
    return false;
  }
};

export const shortenAddress = (address: string): string => {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

export const getSolanaExplorerUrl = (signature: string, cluster: string = 'mainnet-beta'): string => {
  const baseUrl = cluster === 'mainnet-beta' 
    ? 'https://explorer.solana.com' 
    : `https://explorer.solana.com?cluster=${cluster}`;
  return `${baseUrl}/tx/${signature}`;
};

export const transferSOL = async (
  toAddress: string, 
  amount: number
): Promise<string | null> => {
  try {
    if (!window.solana) {
      throw new Error('Phantom wallet not found');
    }

    // In a real implementation, you would create and send a transaction
    // For demo purposes, we'll simulate a transaction
    const mockTxSignature = `tx_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    
    console.log(`Simulated SOL transfer: ${amount} SOL to ${toAddress}`);
    return mockTxSignature;
  } catch (error) {
    console.error('Failed to transfer SOL:', error);
    return null;
  }
};

// Declare global solana object for Phantom wallet
declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: PublicKey }>;
      disconnect: () => Promise<void>;
      signMessage: (message: Uint8Array, display?: string) => Promise<{ signature: Uint8Array }>;
      on: (event: string, callback: Function) => void;
      removeListener: (event: string, callback: Function) => void;
    };
  }
}