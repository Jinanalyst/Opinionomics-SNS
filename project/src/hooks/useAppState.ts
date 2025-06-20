import { useState, useEffect } from 'react';
import { AppState, User, Post, DirectMessage, Conversation, Comment, HashtagData, Notification, TokenReward } from '../types';
import { saveAppState, loadAppState } from '../utils/storage';
import { generatePostId, generateMessageId } from '../utils/crypto';
import { uploadToIPFS, IPFSContent } from '../utils/ipfs';
import { signSolanaMessage } from '../utils/solana';
import { useRewards } from './useRewards';

const initialState: AppState = {
  currentUser: null,
  users: [],
  posts: [],
  conversations: [],
  hashtags: [],
  notifications: [],
  tokenRewards: [],
  rewardPool: {
    totalPool: 10000,
    dailyDistribution: 1000,
    lastDistribution: new Date().toISOString(),
    participantCount: 0,
    averageReward: 0
  },
  solana: { isConnected: false },
  currentView: 'create-profile'
};

export const useAppState = () => {
  const [state, setState] = useState<AppState>(initialState);
  const rewards = useRewards();

  useEffect(() => {
    const savedState = loadAppState();
    if (savedState) {
      setState(prev => ({
        ...savedState,
        solana: prev.solana,
        rewardPool: savedState.rewardPool || prev.rewardPool,
        tokenRewards: savedState.tokenRewards || []
      }));
    }
  }, []);

  useEffect(() => {
    saveAppState(state);
  }, [state]);

  const updateState = (updates: Partial<AppState> | ((prev: AppState) => Partial<AppState>)) => {
    setState(prev => {
      const newUpdates = typeof updates === 'function' ? updates(prev) : updates;
      return { ...prev, ...newUpdates };
    });
  };

  const addUser = (user: User) => {
    const userWithRewards = {
      ...user,
      tokenBalance: user.tokenBalance || 0,
      totalEarned: user.totalEarned || 0,
      engagementScore: user.engagementScore || 0,
      lastRewardClaim: user.lastRewardClaim || new Date().toISOString(),
      totalPosts: user.totalPosts || 0,
      totalLikes: user.totalLikes || 0,
      totalComments: user.totalComments || 0,
      totalShares: user.totalShares || 0
    };

    setState(prev => ({
      ...prev,
      users: [...prev.users, userWithRewards]
    }));
  };

  const updateUser = (updatedUser: User) => {
    setState(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === updatedUser.id ? updatedUser : u),
      currentUser: prev.currentUser?.id === updatedUser.id ? updatedUser : prev.currentUser
    }));
  };

  const addTokenReward = (reward: TokenReward) => {
    setState(prev => ({
      ...prev,
      tokenRewards: [...prev.tokenRewards, reward]
    }));
  };

  const addPost = async (post: Post) => {
    let ipfsHash: string | undefined;
    let web3Verified = false;

    if (state.solana.isConnected && state.solana.publicKey) {
      try {
        const content: IPFSContent = {
          content: post.content,
          timestamp: post.timestamp,
          author: state.solana.publicKey
        };

        const message = `${post.content}|${post.timestamp}|${state.solana.publicKey}`;
        const signature = await signSolanaMessage(message);
        
        if (signature) {
          content.signature = signature;
          ipfsHash = await uploadToIPFS(content);
          web3Verified = true;
        }
      } catch (error) {
        console.error('Failed to store on IPFS:', error);
      }
    }

    const enhancedPost: Post = {
      ...post,
      ipfsHash,
      web3Verified,
      rewardPoints: 0,
      qualityScore: 0,
      engagementMultiplier: 1,
      viralBonus: 0
    };

    setState(prev => {
      const updatedHashtags = [...prev.hashtags];
      post.hashtags.forEach(tag => {
        const existingHashtag = updatedHashtags.find(h => h.tag === tag);
        if (existingHashtag) {
          existingHashtag.count++;
        } else {
          updatedHashtags.push({
            tag,
            count: 1,
            trending: false,
            followers: []
          });
        }
      });

      updatedHashtags.forEach(hashtag => {
        hashtag.trending = hashtag.count > 3;
      });

      // Update user stats
      const updatedUsers = prev.users.map(user => {
        if (user.id === prev.currentUser?.id) {
          return {
            ...user,
            totalPosts: user.totalPosts + 1
          };
        }
        return user;
      });

      const updatedCurrentUser = updatedUsers.find(u => u.id === prev.currentUser?.id);

      return {
        ...prev,
        posts: [enhancedPost, ...prev.posts],
        hashtags: updatedHashtags,
        users: updatedUsers,
        currentUser: updatedCurrentUser || prev.currentUser
      };
    });

    // Award post creation reward
    if (state.currentUser) {
      rewards.calculateAndAwardPostReward(enhancedPost, state.currentUser, addTokenReward);
      rewards.updateUserEngagementScore(state.currentUser, [enhancedPost, ...state.posts], updateUser);
    }
  };

  const toggleLike = (postId: string) => {
    if (!state.currentUser) return;

    setState(prev => {
      const post = prev.posts.find(p => p.id === postId);
      const wasLiked = post?.likes.includes(prev.currentUser!.id);

      const updatedPosts = prev.posts.map(post => {
        if (post.id === postId) {
          const hasLiked = post.likes.includes(prev.currentUser!.id);
          return {
            ...post,
            likes: hasLiked
              ? post.likes.filter(id => id !== prev.currentUser!.id)
              : [...post.likes, prev.currentUser!.id]
          };
        }
        return post;
      });

      const newNotifications = [...prev.notifications];
      if (!wasLiked && post && post.authorId !== prev.currentUser!.id) {
        const notification: Notification = {
          id: `notif_${Date.now()}`,
          userId: post.authorId,
          type: 'like',
          fromUserId: prev.currentUser!.id,
          postId: post.id,
          content: 'liked your post',
          timestamp: new Date().toISOString(),
          read: false
        };
        newNotifications.push(notification);

        // Award engagement reward to the liker
        rewards.awardEngagementReward(prev.currentUser!.id, 'like', postId, addTokenReward);
      }

      // Update user stats
      const updatedUsers = prev.users.map(user => {
        if (user.id === prev.currentUser?.id && !wasLiked) {
          return {
            ...user,
            totalLikes: user.totalLikes + 1
          };
        }
        return user;
      });

      const updatedCurrentUser = updatedUsers.find(u => u.id === prev.currentUser?.id);

      return {
        ...prev,
        posts: updatedPosts,
        notifications: newNotifications,
        users: updatedUsers,
        currentUser: updatedCurrentUser || prev.currentUser
      };
    });
  };

  const toggleFollow = (targetUserId: string) => {
    if (!state.currentUser) return;

    setState(prev => {
      const updatedUsers = prev.users.map(user => {
        if (user.id === prev.currentUser!.id) {
          const isFollowing = user.following.includes(targetUserId);
          return {
            ...user,
            following: isFollowing 
              ? user.following.filter(id => id !== targetUserId)
              : [...user.following, targetUserId]
          };
        }
        if (user.id === targetUserId) {
          const isFollower = user.followers.includes(prev.currentUser!.id);
          return {
            ...user,
            followers: isFollower
              ? user.followers.filter(id => id !== prev.currentUser!.id)
              : [...user.followers, prev.currentUser!.id]
          };
        }
        return user;
      });

      const updatedCurrentUser = updatedUsers.find(u => u.id === prev.currentUser!.id);
      const isNowFollowing = updatedCurrentUser?.following.includes(targetUserId);

      const newNotifications = [...prev.notifications];
      if (isNowFollowing) {
        const notification: Notification = {
          id: `notif_${Date.now()}`,
          userId: targetUserId,
          type: 'follow',
          fromUserId: prev.currentUser!.id,
          content: 'started following you',
          timestamp: new Date().toISOString(),
          read: false
        };
        newNotifications.push(notification);
      }

      return {
        ...prev,
        users: updatedUsers,
        currentUser: updatedCurrentUser || prev.currentUser,
        notifications: newNotifications
      };
    });
  };

  const addComment = async (postId: string, content: string, parentId?: string) => {
    if (!state.currentUser) return;

    let ipfsHash: string | undefined;

    if (state.solana.isConnected && state.solana.publicKey) {
      try {
        const ipfsContent: IPFSContent = {
          content,
          timestamp: new Date().toISOString(),
          author: state.solana.publicKey
        };
        ipfsHash = await uploadToIPFS(ipfsContent);
      } catch (error) {
        console.error('Failed to store comment on IPFS:', error);
      }
    }

    const comment: Comment = {
      id: `comment_${Date.now()}`,
      authorId: state.currentUser.id,
      content,
      timestamp: new Date().toISOString(),
      likes: [],
      dislikes: [],
      parentId,
      replies: [],
      ipfsHash,
      rewardPoints: 0,
      qualityScore: 0
    };

    setState(prev => {
      const post = prev.posts.find(p => p.id === postId);
      
      const updatedPosts = prev.posts.map(post => {
        if (post.id === postId) {
          if (parentId) {
            const addReplyToComment = (comments: Comment[]): Comment[] => {
              return comments.map(c => {
                if (c.id === parentId) {
                  return { ...c, replies: [...c.replies, comment] };
                }
                if (c.replies.length > 0) {
                  return { ...c, replies: addReplyToComment(c.replies) };
                }
                return c;
              });
            };
            return { ...post, comments: addReplyToComment(post.comments) };
          } else {
            return { ...post, comments: [...post.comments, comment] };
          }
        }
        return post;
      });

      const newNotifications = [...prev.notifications];
      if (post && post.authorId !== prev.currentUser!.id) {
        const notification: Notification = {
          id: `notif_${Date.now()}`,
          userId: post.authorId,
          type: 'comment',
          fromUserId: prev.currentUser!.id,
          postId: post.id,
          commentId: comment.id,
          content: 'commented on your post',
          timestamp: new Date().toISOString(),
          read: false
        };
        newNotifications.push(notification);
      }

      // Update user stats
      const updatedUsers = prev.users.map(user => {
        if (user.id === prev.currentUser?.id) {
          return {
            ...user,
            totalComments: user.totalComments + 1
          };
        }
        return user;
      });

      const updatedCurrentUser = updatedUsers.find(u => u.id === prev.currentUser?.id);

      return {
        ...prev,
        posts: updatedPosts,
        notifications: newNotifications,
        users: updatedUsers,
        currentUser: updatedCurrentUser || prev.currentUser
      };
    });

    // Award comment reward
    if (state.currentUser) {
      rewards.calculateAndAwardCommentReward(comment, state.currentUser, addTokenReward);
    }
  };

  const addRetweet = (postId: string, comment?: string, type: 'direct' | 'quote' = 'direct') => {
    if (!state.currentUser) return;

    const originalPost = state.posts.find(p => p.id === postId);
    if (!originalPost) return;

    const repost = {
      id: generatePostId(),
      userId: state.currentUser.id,
      timestamp: new Date().toISOString(),
      comment,
      type
    };

    setState(prev => {
      const updatedPosts = prev.posts.map(post => 
        post.id === postId 
          ? { ...post, reposts: [...post.reposts, repost] }
          : post
      );

      // Update user stats
      const updatedUsers = prev.users.map(user => {
        if (user.id === prev.currentUser?.id) {
          return {
            ...user,
            totalShares: user.totalShares + 1
          };
        }
        return user;
      });

      const updatedCurrentUser = updatedUsers.find(u => u.id === prev.currentUser?.id);

      return {
        ...prev,
        posts: updatedPosts,
        users: updatedUsers,
        currentUser: updatedCurrentUser || prev.currentUser
      };
    });

    if (type === 'quote' && comment) {
      const quotePost: Post = {
        id: generatePostId(),
        authorId: state.currentUser.id,
        content: comment,
        timestamp: new Date().toISOString(),
        likes: [],
        reposts: [],
        comments: [],
        hashtags: comment.match(/#\w+/g)?.map(tag => tag.substring(1)) || [],
        mentions: comment.match(/@\w+/g)?.map(mention => mention.substring(1)) || [],
        originalPostId: postId,
        retweetComment: comment,
        rewardPoints: 0,
        qualityScore: 0,
        engagementMultiplier: 1,
        viralBonus: 0
      };
      
      setState(prev => ({
        ...prev,
        posts: [quotePost, ...prev.posts]
      }));
    }

    if (originalPost.authorId !== state.currentUser.id) {
      const notification: Notification = {
        id: `notif_${Date.now()}`,
        userId: originalPost.authorId,
        type: 'like',
        fromUserId: state.currentUser.id,
        postId: originalPost.id,
        content: type === 'quote' ? 'quoted your post' : 'retweeted your post',
        timestamp: new Date().toISOString(),
        read: false
      };

      setState(prev => ({
        ...prev,
        notifications: [...prev.notifications, notification]
      }));

      // Award share reward
      rewards.awardEngagementReward(state.currentUser.id, 'share', postId, addTokenReward);
    }
  };

  const toggleCommentLike = (postId: string, commentId: string) => {
    if (!state.currentUser) return;

    setState(prev => ({
      ...prev,
      posts: prev.posts.map(post => {
        if (post.id === postId) {
          const updateCommentLikes = (comments: Comment[]): Comment[] => {
            return comments.map(comment => {
              if (comment.id === commentId) {
                const hasLiked = comment.likes.includes(prev.currentUser!.id);
                return {
                  ...comment,
                  likes: hasLiked
                    ? comment.likes.filter(id => id !== prev.currentUser!.id)
                    : [...comment.likes, prev.currentUser!.id]
                };
              }
              if (comment.replies.length > 0) {
                return { ...comment, replies: updateCommentLikes(comment.replies) };
              }
              return comment;
            });
          };
          return { ...post, comments: updateCommentLikes(post.comments) };
        }
        return post;
      })
    }));
  };

  const toggleCommentDislike = (postId: string, commentId: string) => {
    if (!state.currentUser) return;

    setState(prev => ({
      ...prev,
      posts: prev.posts.map(post => {
        if (post.id === postId) {
          const updateCommentDislikes = (comments: Comment[]): Comment[] => {
            return comments.map(comment => {
              if (comment.id === commentId) {
                const hasDisliked = comment.dislikes.includes(prev.currentUser!.id);
                return {
                  ...comment,
                  dislikes: hasDisliked
                    ? comment.dislikes.filter(id => id !== prev.currentUser!.id)
                    : [...comment.dislikes, prev.currentUser!.id]
                };
              }
              if (comment.replies.length > 0) {
                return { ...comment, replies: updateCommentDislikes(comment.replies) };
              }
              return comment;
            });
          };
          return { ...post, comments: updateCommentDislikes(post.comments) };
        }
        return post;
      })
    }));
  };

  const followHashtag = (hashtag: string) => {
    if (!state.currentUser) return;

    setState(prev => {
      const isFollowing = prev.currentUser!.followedHashtags.includes(hashtag);
      
      const updatedUser = {
        ...prev.currentUser!,
        followedHashtags: isFollowing
          ? prev.currentUser!.followedHashtags.filter(h => h !== hashtag)
          : [...prev.currentUser!.followedHashtags, hashtag]
      };

      const updatedHashtags = prev.hashtags.map(h => {
        if (h.tag === hashtag) {
          return {
            ...h,
            followers: isFollowing
              ? h.followers.filter(id => id !== prev.currentUser!.id)
              : [...h.followers, prev.currentUser!.id]
          };
        }
        return h;
      });

      return {
        ...prev,
        currentUser: updatedUser,
        users: prev.users.map(u => u.id === updatedUser.id ? updatedUser : u),
        hashtags: updatedHashtags
      };
    });
  };

  const sendMessage = (receiverId: string, content: string) => {
    if (!state.currentUser) return;

    const message: DirectMessage = {
      id: generateMessageId(),
      senderId: state.currentUser.id,
      receiverId,
      content,
      timestamp: new Date().toISOString(),
      encrypted: true
    };

    setState(prev => {
      let updatedConversations = [...prev.conversations];
      const existingConversation = updatedConversations.find(c => 
        c.participants.includes(prev.currentUser!.id) && c.participants.includes(receiverId)
      );

      if (existingConversation) {
        updatedConversations = updatedConversations.map(c => 
          c.id === existingConversation.id 
            ? { ...c, messages: [...c.messages, message], lastMessage: message }
            : c
        );
      } else {
        const newConversation: Conversation = {
          id: `conv_${Date.now()}`,
          participants: [prev.currentUser!.id, receiverId],
          lastMessage: message,
          messages: [message]
        };
        updatedConversations.push(newConversation);
      }

      return {
        ...prev,
        conversations: updatedConversations
      };
    });
  };

  const markNotificationAsRead = (notificationId: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    }));
  };

  const markAllNotificationsAsRead = () => {
    if (!state.currentUser) return;
    
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => 
        n.userId === prev.currentUser!.id ? { ...n, read: true } : n
      )
    }));
  };

  const claimAllRewards = () => {
    if (!state.currentUser) return;

    const claimedAmount = rewards.claimRewards(
      state.currentUser.id,
      state.tokenRewards,
      (updatedRewards) => setState(prev => ({ ...prev, tokenRewards: updatedRewards })),
      updateUser,
      state.currentUser
    );

    if (claimedAmount > 0) {
      const notification: Notification = {
        id: `reward_notif_${Date.now()}`,
        userId: state.currentUser.id,
        type: 'reward',
        fromUserId: 'system',
        content: `claimed ${claimedAmount.toFixed(2)} OPIN tokens`,
        timestamp: new Date().toISOString(),
        read: false,
        rewardAmount: claimedAmount
      };

      setState(prev => ({
        ...prev,
        notifications: [...prev.notifications, notification]
      }));
    }

    return claimedAmount;
  };

  const withdrawTokens = (amount: number) => {
    if (!state.currentUser) return;

    const result = rewards.processWithdrawal(state.currentUser, amount, updateUser);
    
    if (result.success) {
      const notification: Notification = {
        id: `withdraw_notif_${Date.now()}`,
        userId: state.currentUser.id,
        type: 'reward',
        fromUserId: 'system',
        content: `withdrew ${amount.toFixed(2)} OPIN to Solana`,
        timestamp: new Date().toISOString(),
        read: false
      };

      setState(prev => ({
        ...prev,
        notifications: [...prev.notifications, notification]
      }));
    }

    return result;
  };

  return {
    state,
    updateState,
    addUser,
    updateUser,
    addPost,
    addRetweet,
    toggleFollow,
    toggleLike,
    addComment,
    toggleCommentLike,
    toggleCommentDislike,
    followHashtag,
    sendMessage,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    claimAllRewards,
    withdrawTokens
  };
};