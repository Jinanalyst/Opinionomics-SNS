import { useState, useEffect } from 'react';
import { TokenReward, User, Post, Comment } from '../types';
import { 
  calculatePostReward, 
  calculateCommentReward, 
  calculateEngagementScore,
  getQualityScore,
  simulateSmartContract 
} from '../utils/rewards';

export const useRewards = () => {
  const [rewardPool, setRewardPool] = useState({
    totalPool: 10000,
    dailyDistribution: 1000,
    lastDistribution: new Date().toISOString(),
    participantCount: 0,
    averageReward: 0
  });

  const calculateAndAwardPostReward = (
    post: Post,
    user: User,
    onAddReward: (reward: TokenReward) => void
  ) => {
    const qualityScore = getQualityScore(post.content);
    const rewardCalc = calculatePostReward(
      post.likes.length,
      post.comments.length,
      post.reposts.length,
      qualityScore,
      post.content.length
    );

    const reward: TokenReward = {
      id: `reward_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      userId: user.id,
      type: 'post',
      amount: rewardCalc.totalReward,
      postId: post.id,
      timestamp: new Date().toISOString(),
      claimed: false
    };

    // Track activity in smart contract
    simulateSmartContract.trackActivity(user.id, 'post', {
      postId: post.id,
      qualityScore,
      engagement: post.likes.length + post.comments.length + post.reposts.length
    });

    // Distribute reward
    simulateSmartContract.distributeRewards(user.id, reward.amount, 'post_creation');

    onAddReward(reward);

    // Add viral bonus if applicable
    if (rewardCalc.viralBonus > 0) {
      const viralReward: TokenReward = {
        id: `viral_${Date.now()}_${Math.random().toString(36).substring(2)}`,
        userId: user.id,
        type: 'viral_bonus',
        amount: rewardCalc.viralBonus,
        postId: post.id,
        timestamp: new Date().toISOString(),
        claimed: false
      };
      onAddReward(viralReward);
    }

    return rewardCalc;
  };

  const calculateAndAwardCommentReward = (
    comment: Comment,
    user: User,
    onAddReward: (reward: TokenReward) => void
  ) => {
    const qualityScore = getQualityScore(comment.content);
    const rewardAmount = calculateCommentReward(
      comment.likes.length,
      comment.dislikes.length,
      qualityScore
    );

    const reward: TokenReward = {
      id: `comment_reward_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      userId: user.id,
      type: 'comment',
      amount: rewardAmount,
      commentId: comment.id,
      timestamp: new Date().toISOString(),
      claimed: false
    };

    simulateSmartContract.trackActivity(user.id, 'comment', {
      commentId: comment.id,
      qualityScore,
      engagement: comment.likes.length - comment.dislikes.length
    });

    simulateSmartContract.distributeRewards(user.id, reward.amount, 'comment_creation');

    onAddReward(reward);
    return rewardAmount;
  };

  const awardEngagementReward = (
    userId: string,
    type: 'like' | 'share',
    targetId: string,
    onAddReward: (reward: TokenReward) => void
  ) => {
    const amount = type === 'like' ? 0.1 : 0.3;
    
    const reward: TokenReward = {
      id: `${type}_reward_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      userId,
      type,
      amount,
      postId: targetId,
      timestamp: new Date().toISOString(),
      claimed: false
    };

    simulateSmartContract.trackActivity(userId, type, { targetId });
    simulateSmartContract.distributeRewards(userId, reward.amount, `${type}_engagement`);

    onAddReward(reward);
    return amount;
  };

  const updateUserEngagementScore = (
    user: User,
    posts: Post[],
    onUpdateUser: (user: User) => void
  ) => {
    const userPosts = posts.filter(p => p.authorId === user.id);
    const totalLikes = userPosts.reduce((sum, p) => sum + p.likes.length, 0);
    const totalComments = userPosts.reduce((sum, p) => sum + p.comments.length, 0);
    const totalShares = userPosts.reduce((sum, p) => sum + p.reposts.length, 0);

    const engagementScore = calculateEngagementScore(
      userPosts.length,
      totalLikes,
      totalComments,
      totalShares,
      user.followers.length
    );

    const updatedUser = {
      ...user,
      engagementScore
    };

    onUpdateUser(updatedUser);
    return engagementScore;
  };

  const claimRewards = (
    userId: string,
    rewards: TokenReward[],
    onUpdateRewards: (rewards: TokenReward[]) => void,
    onUpdateUser: (user: User) => void,
    currentUser: User
  ) => {
    const unclaimedRewards = rewards.filter(r => r.userId === userId && !r.claimed);
    const totalAmount = unclaimedRewards.reduce((sum, r) => sum + r.amount, 0);

    if (totalAmount > 0) {
      // Mark rewards as claimed
      const updatedRewards = rewards.map(r => 
        r.userId === userId && !r.claimed ? { ...r, claimed: true } : r
      );

      // Update user balance
      const updatedUser = {
        ...currentUser,
        tokenBalance: currentUser.tokenBalance + totalAmount,
        totalEarned: currentUser.totalEarned + totalAmount,
        lastRewardClaim: new Date().toISOString()
      };

      simulateSmartContract.distributeRewards(userId, totalAmount, 'reward_claim');

      onUpdateRewards(updatedRewards);
      onUpdateUser(updatedUser);

      return totalAmount;
    }

    return 0;
  };

  const processWithdrawal = (
    user: User,
    amount: number,
    onUpdateUser: (user: User) => void
  ) => {
    if (amount <= user.tokenBalance && user.solanaAddress) {
      const result = simulateSmartContract.processWithdrawal(
        user.id,
        amount,
        user.solanaAddress
      );

      if (result.success) {
        const updatedUser = {
          ...user,
          tokenBalance: user.tokenBalance - amount
        };

        onUpdateUser(updatedUser);
        return result;
      }
    }

    return { success: false, error: 'Insufficient balance or missing Solana address' };
  };

  return {
    rewardPool,
    calculateAndAwardPostReward,
    calculateAndAwardCommentReward,
    awardEngagementReward,
    updateUserEngagementScore,
    claimRewards,
    processWithdrawal
  };
};