import React, { useState } from 'react';
import { UserCircle as UserCirclePlus, Key, Shield, Wallet } from 'lucide-react';
import { User } from '../types';
import { generateKeyPair, createUserId } from '../utils/crypto';
import { saveUserKeys } from '../utils/storage';
import { SolanaState } from '../types';
import { shortenAddress } from '../utils/solana';

interface CreateProfileProps {
  onCreateProfile: (user: User) => void;
  solanaState: SolanaState;
}

export const CreateProfile: React.FC<CreateProfileProps> = ({ onCreateProfile, solanaState }) => {
  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    bio: '',
    avatar: 'https://images.pexels.com/photos/3211476/pexels-photo-3211476.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const { publicKey, privateKey } = generateKeyPair();
    const userId = createUserId(publicKey);
    
    const newUser: User = {
      id: userId,
      username: formData.username,
      displayName: formData.displayName,
      bio: formData.bio,
      avatar: formData.avatar,
      publicKey,
      walletAddress: solanaState.publicKey,
      ensName: undefined,
      followers: [],
      following: [],
      followedHashtags: [],
      createdAt: new Date().toISOString(),
      verified: false,
      web3Verified: true,
      privacySettings: {
        profileVisibility: 'public',
        messagePermissions: 'everyone',
        showLocation: true,
        showWebsite: true
      },
      notificationSettings: {
        likes: true,
        comments: true,
        follows: true,
        mentions: true,
        hashtags: true
      }
    };

    // Save private key securely
    saveUserKeys(userId, privateKey);
    
    onCreateProfile(newUser);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserCirclePlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Your Profile</h1>
          <p className="text-gray-600">Complete your decentralized identity</p>
        </div>

        {/* Solana Wallet Status */}
        <div className="bg-green-50 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3">
            <Wallet className="w-5 h-5 text-green-600" />
            <div>
              <h3 className="text-sm font-medium text-green-900">Wallet Connected</h3>
              <p className="text-xs text-green-700">
                {shortenAddress(solanaState.publicKey!)}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
              placeholder="@username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Name
            </label>
            <input
              type="text"
              required
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none"
              rows={3}
              placeholder="Tell us about yourself..."
            />
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-purple-900 mb-1">Web3 Identity</h3>
                <p className="text-xs text-purple-700">
                  Your profile will be linked to your wallet address and verified on-chain. 
                  Posts will be stored on IPFS for permanent decentralized access.
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Key className="w-4 h-4" />
            <span>Create Profile & Enter</span>
          </button>
        </form>
      </div>
    </div>
  );
};