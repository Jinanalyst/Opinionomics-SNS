import React from 'react';
import { Wallet, Shield, Globe, Zap, TrendingUp, Users, Coins } from 'lucide-react';
import { SolanaState } from '../types';
import { SEOHead } from './SEOHead';

interface WalletLandingProps {
  onConnect: () => Promise<any>;
  solanaState: SolanaState;
}

export const WalletLanding: React.FC<WalletLandingProps> = ({ onConnect, solanaState }) => {
  const handleConnect = async () => {
    try {
      await onConnect();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  return (
    <>
      <SEOHead 
        title="Opinionomics - Connect Your Solana Wallet"
        description="Connect your Solana wallet to join the first write-to-earn social media platform. Share opinions, earn OPIN tokens, and own your digital identity."
      />
      
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-6xl mx-auto text-center">
          {/* Hero Section */}
          <div className="mb-16">
            <div className="w-32 h-32 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <img 
                src="/opinionomics-logo.png" 
                alt="Opinionomics" 
                className="h-16 w-auto"
              />
            </div>
            <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Welcome to
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent block mt-2">
                Opinionomics
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              The first write-to-earn social media platform built on Solana. Connect your wallet to share opinions, 
              earn OPIN tokens, and join a truly decentralized community where your voice has value.
            </p>
            
            {/* Connect Button */}
            <button
              onClick={handleConnect}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-12 py-4 rounded-2xl font-semibold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl flex items-center space-x-3 mx-auto mb-6"
            >
              <Wallet className="w-6 h-6" />
              <span>Connect Solana Wallet</span>
            </button>
            
            <p className="text-sm text-gray-500">
              Supports Phantom, Solflare, and other Solana wallets
            </p>
          </div>

          {/* Stats Section */}
          <div className="grid md:grid-cols-4 gap-6 mb-16">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">10K+</h3>
              <p className="text-gray-600 text-sm">Active Users</p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Coins className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">1M+</h3>
              <p className="text-gray-600 text-sm">OPIN Distributed</p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">50K+</h3>
              <p className="text-gray-600 text-sm">Posts Created</p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Zap className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">99.9%</h3>
              <p className="text-gray-600 text-sm">Uptime</p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Own Your Identity</h3>
              <p className="text-gray-600 leading-relaxed">
                Your cryptographic identity is secured by Solana. No central authority can control or censor your content.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Globe className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Decentralized Storage</h3>
              <p className="text-gray-600 leading-relaxed">
                Your content is stored on IPFS and verified on Solana, ensuring permanent accessibility and authenticity.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Coins className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Earn While You Share</h3>
              <p className="text-gray-600 leading-relaxed">
                Get rewarded with OPIN tokens for creating quality content and engaging with the community.
              </p>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-12 text-white mb-16">
            <h2 className="text-3xl font-bold mb-8">How Opinionomics Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Connect Wallet</h3>
                <p className="text-purple-100">Link your Solana wallet to create your decentralized identity</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                  <span className="text-2xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Share & Engage</h3>
                <p className="text-purple-100">Post content, comment, and interact with the community</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                  <span className="text-2xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Earn Rewards</h3>
                <p className="text-purple-100">Receive OPIN tokens based on engagement and quality</p>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to join the revolution?</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Be part of the future of social media where users own their data, control their identity, 
              and get rewarded for valuable contributions.
            </p>
            <button
              onClick={handleConnect}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-colors flex items-center space-x-2 mx-auto"
            >
              <Wallet className="w-5 h-5" />
              <span>Connect Your Solana Wallet</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};