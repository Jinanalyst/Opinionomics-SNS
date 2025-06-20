export interface User {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatar: string;
  coverPhoto?: string;
  location?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
  publicKey: string;
  walletAddress?: string;
  solanaAddress?: string;
  ensName?: string;
  followers: string[];
  following: string[];
  followedHashtags: string[];
  createdAt: string;
  verified: boolean;
  web3Verified?: boolean;
  ipfsHash?: string;
  // Token rewards
  tokenBalance: number;
  totalEarned: number;
  engagementScore: number;
  lastRewardClaim: string;
  // Engagement metrics
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  privacySettings: {
    profileVisibility: 'public' | 'followers' | 'private';
    messagePermissions: 'everyone' | 'followers' | 'none';
    showLocation: boolean;
    showWebsite: boolean;
  };
  notificationSettings: {
    likes: boolean;
    comments: boolean;
    follows: boolean;
    mentions: boolean;
    hashtags: boolean;
  };
}

export interface Comment {
  id: string;
  authorId: string;
  content: string;
  timestamp: string;
  likes: string[];
  dislikes: string[];
  parentId?: string;
  replies: Comment[];
  ipfsHash?: string;
  txHash?: string;
  // Reward data
  rewardPoints: number;
  qualityScore: number;
}

export interface Post {
  id: string;
  authorId: string;
  content: string;
  mediaUrl?: string;
  timestamp: string;
  likes: string[];
  reposts: Repost[];
  comments: Comment[];
  hashtags: string[];
  mentions: string[];
  originalPostId?: string;
  retweetComment?: string;
  ipfsHash?: string;
  txHash?: string;
  web3Verified?: boolean;
  // Reward data
  rewardPoints: number;
  qualityScore: number;
  engagementMultiplier: number;
  viralBonus: number;
}

export interface Repost {
  id: string;
  userId: string;
  timestamp: string;
  comment?: string;
  type: 'direct' | 'quote';
}

export interface HashtagData {
  tag: string;
  count: number;
  trending: boolean;
  followers: string[];
}

export interface DirectMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  encrypted: boolean;
  ipfsHash?: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage: DirectMessage;
  messages: DirectMessage[];
}

export interface Notification {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'hashtag' | 'reward';
  fromUserId: string;
  postId?: string;
  commentId?: string;
  content: string;
  timestamp: string;
  read: boolean;
  rewardAmount?: number;
}

export interface TokenReward {
  id: string;
  userId: string;
  type: 'post' | 'comment' | 'like' | 'share' | 'engagement' | 'viral_bonus' | 'quality_bonus';
  amount: number;
  postId?: string;
  commentId?: string;
  timestamp: string;
  txHash?: string;
  claimed: boolean;
}

export interface RewardPool {
  totalPool: number;
  dailyDistribution: number;
  lastDistribution: string;
  participantCount: number;
  averageReward: number;
}

export interface SolanaState {
  isConnected: boolean;
  publicKey?: string;
  balance?: number;
  cluster?: 'mainnet-beta' | 'testnet' | 'devnet';
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  posts: Post[];
  conversations: Conversation[];
  hashtags: HashtagData[];
  notifications: Notification[];
  tokenRewards: TokenReward[];
  rewardPool: RewardPool;
  solana: SolanaState;
  currentView: 'feed' | 'profile' | 'messages' | 'settings' | 'create-profile' | 'edit-profile' | 'hashtag' | 'notifications' | 'creator-dashboard';
  selectedUserId?: string;
  selectedConversationId?: string;
  selectedHashtag?: string;
  searchQuery?: string;
}