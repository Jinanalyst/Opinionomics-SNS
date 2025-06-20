import React from 'react';
import { Database, ExternalLink, Shield, AlertCircle } from 'lucide-react';
import { getIPFSGatewayUrl } from '../utils/ipfs';

interface IPFSStatusProps {
  ipfsHash?: string;
  txHash?: string;
  web3Verified?: boolean;
  chainId?: number;
}

export const IPFSStatus: React.FC<IPFSStatusProps> = ({
  ipfsHash,
  txHash,
  web3Verified,
  chainId
}) => {
  if (!ipfsHash && !txHash && !web3Verified) {
    return null;
  }

  return (
    <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
      <div className="flex items-center space-x-2 mb-2">
        <Database className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-medium text-blue-900">Decentralized Storage</span>
      </div>
      
      <div className="space-y-2">
        {ipfsHash && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-blue-700">IPFS Hash:</span>
            <a
              href={getIPFSGatewayUrl(ipfsHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 font-mono"
            >
              <span>{ipfsHash.substring(0, 12)}...</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
        
        {web3Verified && (
          <div className="flex items-center space-x-1">
            <Shield className="w-3 h-3 text-green-600" />
            <span className="text-xs text-green-700 font-medium">Web3 Verified</span>
          </div>
        )}
        
        {!web3Verified && (ipfsHash || txHash) && (
          <div className="flex items-center space-x-1">
            <AlertCircle className="w-3 h-3 text-orange-600" />
            <span className="text-xs text-orange-700">Pending verification</span>
          </div>
        )}
      </div>
    </div>
  );
};