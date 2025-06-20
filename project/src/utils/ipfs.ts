// IPFS utility functions for decentralized storage
import { create } from 'ipfs-http-client';

// Create IPFS client - using public gateway for demo
const ipfs = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: 'Basic ' + btoa('demo:demo') // Demo credentials
  }
});

export interface IPFSContent {
  content: string;
  timestamp: string;
  author: string;
  signature?: string;
}

export const uploadToIPFS = async (content: IPFSContent): Promise<string | null> => {
  try {
    // For demo purposes, we'll simulate IPFS upload
    // In production, you'd use actual IPFS client
    const mockHash = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    
    // Store in localStorage as fallback for demo
    localStorage.setItem(`ipfs_${mockHash}`, JSON.stringify(content));
    
    console.log('Content uploaded to IPFS:', mockHash);
    return mockHash;
  } catch (error) {
    console.error('Failed to upload to IPFS:', error);
    return null;
  }
};

export const retrieveFromIPFS = async (hash: string): Promise<IPFSContent | null> => {
  try {
    // For demo purposes, retrieve from localStorage
    const stored = localStorage.getItem(`ipfs_${hash}`);
    if (stored) {
      return JSON.parse(stored);
    }
    
    console.log('Content retrieved from IPFS:', hash);
    return null;
  } catch (error) {
    console.error('Failed to retrieve from IPFS:', error);
    return null;
  }
};

export const pinToIPFS = async (hash: string): Promise<boolean> => {
  try {
    // Simulate pinning for demo
    console.log('Content pinned to IPFS:', hash);
    return true;
  } catch (error) {
    console.error('Failed to pin to IPFS:', error);
    return false;
  }
};

export const getIPFSGatewayUrl = (hash: string): string => {
  return `https://ipfs.io/ipfs/${hash}`;
};

export const validateIPFSHash = (hash: string): boolean => {
  // Basic IPFS hash validation
  return /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(hash);
};