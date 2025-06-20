import React, { useState } from 'react';
import { Wallet, Shield, ExternalLink, Copy, Check } from 'lucide-react';
import { connectWallet, shortenAddress } from '../utils/web3';
import { Web3State } from '../types';

interface Web3ConnectProps {
  web3State: Web3State;
  onConnect: (web3Data: Omit<Web3State, 'isConnected'>) => void;
  onDisconnect: () => void;
}

export const Web3Connect: React.FC<Web3ConnectProps> = ({
  web3State,
  onConnect,
  onDisconnect
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const result = await connectWallet();
      if (result) {
        onConnect(result);
      }
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const copyAddress = async () => {
    if (web3State.address) {
      await navigator.clipboard.writeText(web3State.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getChainName = (chainId: number) => {
    const chains: Record<number, string> = {
      1: 'Ethereum',
      5: 'Goerli',
      137: 'Polygon',
      80001: 'Mumbai'
    };
    return chains[chainId] || `Chain ${chainId}`;
  };

  if (!web3State.isConnected) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect Your Wallet</h3>
          <p className="text-gray-600 mb-6">
            Connect your Web3 wallet to verify your identity and store content on IPFS
          </p>
          
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
          >
            <Wallet className="w-5 h-5" />
            <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
          </button>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-left">
                <h4 className="text-sm font-medium text-blue-900 mb-1">Web3 Benefits</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Verify your identity cryptographically</li>
                  <li>• Store posts permanently on IPFS</li>
                  <li>• Own your data completely</li>
                  <li>• Interact with other dApps</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Wallet Connected</h3>
            <p className="text-sm text-green-600">Web3 Identity Verified</p>
          </div>
        </div>
        <button
          onClick={onDisconnect}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm font-medium text-gray-700">Address</p>
            <p className="text-sm text-gray-900 font-mono">
              {web3State.ensName || shortenAddress(web3State.address!)}
            </p>
          </div>
          <button
            onClick={copyAddress}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {web3State.chainId && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-700">Network</p>
              <p className="text-sm text-gray-900">{getChainName(web3State.chainId)}</p>
            </div>
          </div>
        )}

        {web3State.balance && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-700">Balance</p>
              <p className="text-sm text-gray-900">{parseFloat(web3State.balance).toFixed(4)} ETH</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-green-600" />
          <p className="text-sm text-green-700 font-medium">
            Your posts will be stored on IPFS and verified on-chain
          </p>
        </div>
      </div>
    </div>
  );
};