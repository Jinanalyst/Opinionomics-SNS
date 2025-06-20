import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Coins, 
  Download, 
  Calendar, 
  Users, 
  Heart, 
  MessageCircle, 
  Share,
  Award,
  Target,
  Zap,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { AppState, TokenReward } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface CreatorDashboardProps {
  state: AppState;
  onWithdrawTokens: (amount: number) => void;
  onClaimRewards: () => void;
}

export const CreatorDashboard: React.FC<CreatorDashboardProps> = ({
  state,
  onWithdrawTokens,
  onClaimRewards
}) => {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'earnings' | 'analytics' | 'withdraw'>('overview');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  const { currentUser, tokenRewards, posts, rewardPool } = state;

  if (!currentUser) return null;

  // Calculate user statistics
  const userPosts = posts.filter(p => p.authorId === currentUser.id);
  const userRewards = tokenRewards.filter(r => r.userId === currentUser.id);
  const unclaimedRewards = userRewards.filter(r => !r.claimed);
  const totalUnclaimed = unclaimedRewards.reduce((sum, r) => sum + r.amount, 0);

  // Calculate engagement metrics
  const totalLikes = userPosts.reduce((sum, p) => sum + p.likes.length, 0);
  const totalComments = userPosts.reduce((sum, p) => sum + p.comments.length, 0);
  const totalShares = userPosts.reduce((sum, p) => sum + p.reposts.length, 0);
  const avgEngagement = userPosts.length > 0 ? (totalLikes + totalComments + totalShares) / userPosts.length : 0;

  // Generate earnings data for charts
  const earningsData = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const data = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayRewards = userRewards.filter(r => 
        r.timestamp.split('T')[0] === dateStr
      );
      
      const totalEarned = dayRewards.reduce((sum, r) => sum + r.amount, 0);
      
      data.push({
        date: dateStr,
        earnings: totalEarned,
        posts: userPosts.filter(p => p.timestamp.split('T')[0] === dateStr).length,
        engagement: dayRewards.filter(r => r.type === 'engagement').length
      });
    }
    
    return data;
  }, [userRewards, userPosts, timeRange]);

  // Reward type distribution
  const rewardTypeData = useMemo(() => {
    const types = ['post', 'comment', 'like', 'share', 'engagement', 'viral_bonus', 'quality_bonus'];
    return types.map(type => ({
      name: type.replace('_', ' ').toUpperCase(),
      value: userRewards.filter(r => r.type === type).reduce((sum, r) => sum + r.amount, 0),
      count: userRewards.filter(r => r.type === type).length
    })).filter(item => item.value > 0);
  }, [userRewards]);

  const COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#6366F1'];

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (amount > 0 && amount <= currentUser.tokenBalance) {
      onWithdrawTokens(amount);
      setWithdrawAmount('');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount * 0.1); // Assuming 1 OPIN = $0.10
  };

  const getPerformanceColor = (value: number, threshold: number) => {
    return value >= threshold ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Creator Dashboard</h1>
            <p className="text-purple-100">Track your earnings and engagement performance</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-purple-200">Total Balance</div>
            <div className="text-4xl font-bold">{currentUser.tokenBalance.toFixed(2)} OPIN</div>
            <div className="text-purple-200">{formatCurrency(currentUser.tokenBalance)}</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unclaimed Rewards</p>
              <p className="text-2xl font-bold text-gray-900">{totalUnclaimed.toFixed(2)}</p>
              <p className="text-sm text-gray-500">{formatCurrency(totalUnclaimed)}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Coins className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          {totalUnclaimed > 0 && (
            <button
              onClick={onClaimRewards}
              className="mt-4 w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition-colors"
            >
              Claim Now
            </button>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Earned</p>
              <p className="text-2xl font-bold text-gray-900">{currentUser.totalEarned.toFixed(2)}</p>
              <p className="text-sm text-gray-500">{formatCurrency(currentUser.totalEarned)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Engagement Score</p>
              <p className="text-2xl font-bold text-gray-900">{currentUser.engagementScore}</p>
              <p className={`text-sm ${getPerformanceColor(currentUser.engagementScore, 75)}`}>
                {currentUser.engagementScore >= 75 ? 'Excellent' : 'Good'}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Engagement</p>
              <p className="text-2xl font-bold text-gray-900">{avgEngagement.toFixed(1)}</p>
              <p className="text-sm text-gray-500">per post</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'earnings', label: 'Earnings', icon: Coins },
              { id: 'analytics', label: 'Analytics', icon: Award },
              { id: 'withdraw', label: 'Withdraw', icon: Download }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Recent Activity */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Rewards</h3>
                <div className="space-y-3">
                  {userRewards.slice(0, 5).map((reward) => (
                    <div key={reward.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          reward.type === 'post' ? 'bg-blue-100' :
                          reward.type === 'comment' ? 'bg-green-100' :
                          reward.type === 'like' ? 'bg-red-100' :
                          reward.type === 'viral_bonus' ? 'bg-purple-100' : 'bg-gray-100'
                        }`}>
                          {reward.type === 'post' && <MessageCircle className="w-4 h-4 text-blue-600" />}
                          {reward.type === 'comment' && <MessageCircle className="w-4 h-4 text-green-600" />}
                          {reward.type === 'like' && <Heart className="w-4 h-4 text-red-600" />}
                          {reward.type === 'viral_bonus' && <Zap className="w-4 h-4 text-purple-600" />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 capitalize">
                            {reward.type.replace('_', ' ')} Reward
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(reward.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">+{reward.amount.toFixed(2)} OPIN</p>
                        <div className="flex items-center space-x-1">
                          {reward.claimed ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <Clock className="w-4 h-4 text-yellow-500" />
                          )}
                          <span className={`text-xs ${reward.claimed ? 'text-green-600' : 'text-yellow-600'}`}>
                            {reward.claimed ? 'Claimed' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Heart className="w-6 h-6 text-blue-600" />
                    <h4 className="font-semibold text-blue-900">Total Likes</h4>
                  </div>
                  <p className="text-3xl font-bold text-blue-900">{totalLikes}</p>
                  <p className="text-blue-700 text-sm">Across {userPosts.length} posts</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <MessageCircle className="w-6 h-6 text-green-600" />
                    <h4 className="font-semibold text-green-900">Total Comments</h4>
                  </div>
                  <p className="text-3xl font-bold text-green-900">{totalComments}</p>
                  <p className="text-green-700 text-sm">Community engagement</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Share className="w-6 h-6 text-purple-600" />
                    <h4 className="font-semibold text-purple-900">Total Shares</h4>
                  </div>
                  <p className="text-3xl font-bold text-purple-900">{totalShares}</p>
                  <p className="text-purple-700 text-sm">Content virality</p>
                </div>
              </div>
            </div>
          )}

          {/* Earnings Tab */}
          {activeTab === 'earnings' && (
            <div className="space-y-8">
              {/* Time Range Selector */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Earnings Overview</h3>
                <div className="flex space-x-2">
                  {['7d', '30d', '90d', 'all'].map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range as any)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        timeRange === range
                          ? 'bg-purple-100 text-purple-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {range === 'all' ? 'All Time' : range.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Earnings Chart */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Daily Earnings</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={earningsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="earnings" stroke="#8B5CF6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Reward Type Distribution */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Reward Distribution</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={rewardTypeData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {rewardTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Reward Breakdown</h4>
                  <div className="space-y-3">
                    {rewardTypeData.map((item, index) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-sm font-medium text-gray-700">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">{item.value.toFixed(2)} OPIN</p>
                          <p className="text-xs text-gray-500">{item.count} rewards</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Post Performance */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Post Performance</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={earningsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="posts" fill="#8B5CF6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Engagement Trends */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Engagement Trends</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={earningsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="engagement" stroke="#10B981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Performing Posts */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Top Performing Posts</h4>
                <div className="space-y-4">
                  {userPosts
                    .sort((a, b) => (b.likes.length + b.comments.length + b.reposts.length) - (a.likes.length + a.comments.length + a.reposts.length))
                    .slice(0, 5)
                    .map((post) => (
                      <div key={post.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-gray-900 line-clamp-2">{post.content}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(post.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Heart className="w-4 h-4" />
                            <span>{post.likes.length}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="w-4 h-4" />
                            <span>{post.comments.length}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Share className="w-4 h-4" />
                            <span>{post.reposts.length}</span>
                          </div>
                          <div className="text-green-600 font-semibold">
                            +{post.rewardPoints.toFixed(1)} OPIN
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Withdraw Tab */}
          {activeTab === 'withdraw' && (
            <div className="max-w-2xl mx-auto space-y-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Withdraw Tokens</h3>
                <p className="text-gray-600">Convert your OPIN tokens to Solana</p>
              </div>

              {/* Withdrawal Form */}
              <div className="bg-white border border-gray-200 rounded-xl p-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount to Withdraw (OPIN)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        max={currentUser.tokenBalance}
                        step="0.01"
                      />
                      <button
                        onClick={() => setWithdrawAmount(currentUser.tokenBalance.toString())}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-600 text-sm font-medium hover:text-purple-700"
                      >
                        Max
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Available: {currentUser.tokenBalance.toFixed(2)} OPIN
                    </p>
                  </div>

                  {/* Conversion Info */}
                  {withdrawAmount && (
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-medium text-purple-900 mb-2">Withdrawal Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-purple-700">Amount:</span>
                          <span className="font-medium text-purple-900">{withdrawAmount} OPIN</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-700">Withdrawal Fee:</span>
                          <span className="font-medium text-purple-900">0.2 SOL</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-700">You'll Receive:</span>
                          <span className="font-medium text-purple-900">
                            {(parseFloat(withdrawAmount) * 0.001).toFixed(6)} SOL
                          </span>
                        </div>
                        <div className="border-t border-purple-200 pt-2">
                          <div className="flex justify-between">
                            <span className="text-purple-700">Fee Recipient:</span>
                            <span className="font-mono text-xs text-purple-900">
                              DXMH7DLXRMHqpwSESmJ918uFhFQSxzvKEb7CA1ZDj1a2
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Solana Wallet Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-white" />
                      </div>
                      <h4 className="font-medium text-gray-900">Solana Wallet</h4>
                    </div>
                    {currentUser.solanaAddress ? (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">Connected Wallet:</p>
                        <p className="font-mono text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                          {currentUser.solanaAddress}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <AlertCircle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-3">Connect your Solana wallet to withdraw</p>
                        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                          Connect Solana Wallet
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Withdraw Button */}
                  <button
                    onClick={handleWithdraw}
                    disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > currentUser.tokenBalance || !currentUser.solanaAddress}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <Download className="w-5 h-5" />
                    <span>Withdraw to Solana</span>
                  </button>
                </div>
              </div>

              {/* Withdrawal History */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Recent Withdrawals</h4>
                <div className="space-y-3">
                  {/* Mock withdrawal history */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">50.00 OPIN → 0.05 SOL</p>
                      <p className="text-sm text-gray-500">2 days ago</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-600">Completed</span>
                    </div>
                  </div>
                  <div className="text-center py-8 text-gray-500">
                    <p>No withdrawal history yet</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};