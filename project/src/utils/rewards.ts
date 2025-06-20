// Token reward calculation utilities
export interface RewardCalculation {
  baseReward: number;
  qualityMultiplier: number;
  engagementMultiplier: number;
  viralBonus: number;
  totalReward: number;
}

export const REWARD_RATES = {
  POST: 1.0,
  COMMENT: 0.5,
  LIKE_RECEIVED: 0.1,
  SHARE_RECEIVED: 0.3,
  ENGAGEMENT_BONUS: 0.2,
  VIRAL_THRESHOLD: 50, // likes + comments + shares
  VIRAL_MULTIPLIER: 2.0,
  QUALITY_THRESHOLD: 0.8,
  QUALITY_MULTIPLIER: 1.5,
  DAILY_POOL: 10000, // Total OPIN distributed daily
  WITHDRAWAL_FEE_SOL: 0.2,
  OPIN_TO_SOL_RATE: 0.001 // 1 OPIN = 0.001 SOL
};

export const calculatePostReward = (
  likes: number,
  comments: number,
  shares: number,
  qualityScore: number = 0.7,
  contentLength: number = 100
): RewardCalculation => {
  const baseReward = REWARD_RATES.POST;
  
  // Quality multiplier based on content quality and length
  const qualityMultiplier = qualityScore >= REWARD_RATES.QUALITY_THRESHOLD 
    ? REWARD_RATES.QUALITY_MULTIPLIER 
    : 1.0;
  
  // Engagement multiplier based on interactions
  const totalEngagement = likes + comments + shares;
  const engagementMultiplier = 1 + (totalEngagement * REWARD_RATES.ENGAGEMENT_BONUS);
  
  // Viral bonus for highly engaging content
  const viralBonus = totalEngagement >= REWARD_RATES.VIRAL_THRESHOLD 
    ? baseReward * REWARD_RATES.VIRAL_MULTIPLIER 
    : 0;
  
  const totalReward = (baseReward * qualityMultiplier * engagementMultiplier) + viralBonus;
  
  return {
    baseReward,
    qualityMultiplier,
    engagementMultiplier,
    viralBonus,
    totalReward
  };
};

export const calculateCommentReward = (
  likes: number,
  dislikes: number,
  qualityScore: number = 0.7
): number => {
  const baseReward = REWARD_RATES.COMMENT;
  const netLikes = Math.max(0, likes - dislikes);
  const qualityMultiplier = qualityScore >= REWARD_RATES.QUALITY_THRESHOLD 
    ? REWARD_RATES.QUALITY_MULTIPLIER 
    : 1.0;
  
  return baseReward * qualityMultiplier * (1 + netLikes * 0.1);
};

export const calculateEngagementScore = (
  posts: number,
  totalLikes: number,
  totalComments: number,
  totalShares: number,
  followers: number
): number => {
  if (posts === 0) return 0;
  
  const avgEngagement = (totalLikes + totalComments + totalShares) / posts;
  const followerRatio = followers > 0 ? avgEngagement / followers : avgEngagement;
  
  // Score out of 100
  return Math.min(100, Math.round(avgEngagement * 2 + followerRatio * 50));
};

export const getQualityScore = (content: string): number => {
  // Simple quality scoring based on content characteristics
  let score = 0.5; // Base score
  
  // Length bonus
  if (content.length > 50) score += 0.1;
  if (content.length > 100) score += 0.1;
  
  // Hashtag usage
  const hashtags = content.match(/#\w+/g) || [];
  if (hashtags.length > 0 && hashtags.length <= 3) score += 0.1;
  
  // Question or engagement
  if (content.includes('?')) score += 0.1;
  
  // No spam indicators
  const spamWords = ['buy now', 'click here', 'free money', 'guaranteed'];
  const hasSpam = spamWords.some(word => content.toLowerCase().includes(word));
  if (!hasSpam) score += 0.1;
  
  return Math.min(1.0, score);
};

export const formatTokenAmount = (amount: number): string => {
  return amount.toFixed(2);
};

export const convertOPINToSOL = (opinAmount: number): number => {
  return opinAmount * REWARD_RATES.OPIN_TO_SOL_RATE;
};

export const calculateWithdrawalFee = (): number => {
  return REWARD_RATES.WITHDRAWAL_FEE_SOL;
};

// Smart contract simulation for reward distribution
export const simulateSmartContract = {
  trackActivity: (userId: string, activityType: string, metadata: any) => {
    console.log(`Smart Contract: Tracking ${activityType} for user ${userId}`, metadata);
    // In real implementation, this would interact with Solana program
  },
  
  distributeRewards: (userId: string, amount: number, reason: string) => {
    console.log(`Smart Contract: Distributing ${amount} OPIN to ${userId} for ${reason}`);
    // In real implementation, this would mint/transfer tokens
  },
  
  processWithdrawal: (userId: string, amount: number, solanaAddress: string) => {
    console.log(`Smart Contract: Processing withdrawal of ${amount} OPIN to ${solanaAddress}`);
    // In real implementation, this would burn OPIN and transfer SOL
    return {
      txHash: `tx_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      success: true
    };
  }
};