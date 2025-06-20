import React from 'react';
import { Shield, Key, Download, Trash2, Users, Globe, Wallet } from 'lucide-react';
import { AppState, SolanaState } from '../types';
import { exportUserData, clearAllData } from '../utils/storage';
import { Web3Connect } from './Web3Connect';
import { shortenAddress } from '../utils/web3';

interface SettingsProps {
  state: AppState;
  onUpdateState: (updates: Partial<AppState>) => void;
  solanaState: SolanaState;
  onSolanaConnect: (solanaData: Omit<SolanaState, 'isConnected'>) => void;
  onSolanaDisconnect: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ 
  state, 
  onUpdateState, 
  solanaState, 
  onSolanaConnect, 
  onSolanaDisconnect 
}: SettingsProps) => {
  const { currentUser } = state;
  
  if (!currentUser) return null;

  const handleExportData = () => {
    const data = exportUserData(currentUser.id, state);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `decentrasocial-${currentUser.username}-data.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      clearAllData();
      onUpdateState({ 
        currentUser: null, 
        users: [], 
        posts: [], 
        conversations: [], 
        currentView: 'create-profile' 
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your decentralized identity and data</p>
      </div>

      <div className="space-y-6">
        {/* Web3 Connection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Wallet className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Web3 Connection</h2>
          </div>
          
          <Web3Connect
            web3State={solanaState}
            onConnect={onSolanaConnect}
            onDisconnect={onSolanaDisconnect}
          />
        </div>

        {/* Identity & Security */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="w-6 h-6 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">Identity & Security</h2>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-3 mb-2">
                <Key className="w-5 h-5 text-purple-600" />
                <h3 className="font-medium text-purple-900">Your Public Key</h3>
              </div>
              <p className="text-sm text-purple-700 font-mono break-all">
                {currentUser.publicKey}
              </p>
              <p className="text-xs text-purple-600 mt-2">
                This is your unique decentralized identity. Share this with others to verify your posts.
              </p>
            </div>

            {currentUser.walletAddress && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <Wallet className="w-5 h-5 text-blue-600" />
                  <h3 className="font-medium text-blue-900">Wallet Address</h3>
                </div>
                <p className="text-sm text-blue-700 font-mono break-all">
                  {currentUser.ensName || shortenAddress(currentUser.walletAddress)}
                </p>
                <p className="text-xs text-blue-600 mt-2">
                  Your Web3 wallet address for on-chain verification and IPFS storage.
                </p>
              </div>
            )}

            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3 mb-2">
                <Globe className="w-5 h-5 text-green-600" />
                <h3 className="font-medium text-green-900">Decentralized Network Status</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-700">IPFS Storage:</span>
                  <span className="text-sm font-medium text-green-800">
                    {solanaState.isConnected ? 'Active' : 'Local Only'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-700">Web3 Verification:</span>
                  <span className="text-sm font-medium text-green-800">
                    {currentUser.web3Verified ? 'Verified' : 'Not Verified'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-700">Network:</span>
                  <span className="text-sm font-medium text-green-800">
                    {solanaState.isConnected ? `Chain ${solanaState.chainId}` : 'Disconnected'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Users className="w-6 h-6 text-teal-600" />
            <h2 className="text-lg font-semibold text-gray-900">Data Management</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Export Your Data</h3>
                <p className="text-sm text-gray-600">
                  Download all your posts, messages, and profile data as JSON
                </p>
              </div>
              <button
                onClick={handleExportData}
                className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-medium text-yellow-900 mb-2">Data Ownership & Storage</h3>
              <div className="text-sm text-yellow-800 space-y-1">
                <p>• <strong>Local Storage:</strong> Profile and social data stored in your browser</p>
                <p>• <strong>IPFS Storage:</strong> Posts and comments stored on decentralized network</p>
                <p>• <strong>Blockchain:</strong> Identity verification and content signatures</p>
                <p>• <strong>You Own Everything:</strong> Export and migrate your data anytime</p>
              </div>
            </div>
          </div>
        </div>

        {/* Web3 Features */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Web3 Features</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">🔐 Cryptographic Identity</h3>
              <p className="text-gray-700">Your identity is secured by your wallet's private key.</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">📦 IPFS Storage</h3>
              <p className="text-gray-700">Posts stored permanently on decentralized network.</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">✅ On-Chain Verification</h3>
              <p className="text-gray-700">Content signed and verifiable on blockchain.</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">🌐 True Ownership</h3>
              <p className="text-gray-700">You control your data, not a corporation.</p>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Trash2 className="w-6 h-6 text-red-600" />
            <h2 className="text-lg font-semibold text-red-900">Danger Zone</h2>
          </div>
          
          <div className="p-4 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-red-900">Clear All Local Data</h3>
                <p className="text-sm text-red-700">
                  This will delete your local identity and data. IPFS content will remain accessible.
                </p>
              </div>
              <button
                onClick={handleClearData}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Clear Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};