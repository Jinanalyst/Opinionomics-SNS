import { User, Post, Conversation, AppState } from '../types';

const STORAGE_KEYS = {
  APP_STATE: 'decentrasocial_state',
  USER_KEYS: 'decentrasocial_keys'
};

export const saveAppState = (state: AppState): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.APP_STATE, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save app state:', error);
  }
};

export const loadAppState = (): AppState | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.APP_STATE);
    if (!saved) return null;
    
    const parsedState = JSON.parse(saved) as AppState;
    
    // Ensure all users have required properties with defaults
    if (parsedState.users) {
      parsedState.users = parsedState.users.map(user => ({
        ...user,
        followedHashtags: user.followedHashtags || [],
        privacySettings: user.privacySettings || {
          profileVisibility: 'public',
          allowDirectMessages: true,
          showFollowers: true,
          showFollowing: true
        },
        notificationSettings: user.notificationSettings || {
          likes: true,
          comments: true,
          follows: true,
          mentions: true,
          directMessages: true
        }
      }));
    }
    
    return parsedState;
  } catch (error) {
    console.error('Failed to load app state:', error);
    return null;
  }
};

export const saveUserKeys = (userId: string, privateKey: string): void => {
  try {
    const keys = loadUserKeys();
    keys[userId] = privateKey;
    localStorage.setItem(STORAGE_KEYS.USER_KEYS, JSON.stringify(keys));
  } catch (error) {
    console.error('Failed to save user keys:', error);
  }
};

export const loadUserKeys = (): Record<string, string> => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.USER_KEYS);
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    console.error('Failed to load user keys:', error);
    return {};
  }
};

export const exportUserData = (userId: string, state: AppState): string => {
  const userData = {
    user: state.users.find(u => u.id === userId),
    posts: state.posts.filter(p => p.authorId === userId),
    conversations: state.conversations.filter(c => c.participants.includes(userId))
  };
  
  return JSON.stringify(userData, null, 2);
};

export const clearAllData = (): void => {
  localStorage.removeItem(STORAGE_KEYS.APP_STATE);
  localStorage.removeItem(STORAGE_KEYS.USER_KEYS);
};