import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Header } from './components/Header';
import { CreateProfile } from './components/CreateProfile';
import { Feed } from './components/Feed';
import { Profile } from './components/Profile';
import { Messages } from './components/Messages';
import { Settings } from './components/Settings';
import { EditProfile } from './components/EditProfile';
import { HashtagSearch } from './components/HashtagSearch';
import { Notifications } from './components/Notifications';
import { WalletLanding } from './components/WalletLanding';
import { CreatorDashboard } from './components/CreatorDashboard';
import { SEOHead } from './components/SEOHead';
import { useAppState } from './hooks/useAppState';
import { useSolana } from './hooks/useSolana';
import { User } from './types';

function App() {
  const {
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
  } = useAppState();

  const { solanaState, connect, disconnect } = useSolana();

  if (!solanaState.isConnected) {
    return (
      <HelmetProvider>
        <WalletLanding onConnect={connect} solanaState={solanaState} />
      </HelmetProvider>
    );
  }

  if (!state.currentUser) {
    return (
      <HelmetProvider>
        <CreateProfile onCreateProfile={handleCreateProfile} solanaState={solanaState} />
      </HelmetProvider>
    );
  }

  function handleCreateProfile(user: User) {
    const enhancedUser = {
      ...user,
      solanaAddress: solanaState.publicKey,
      web3Verified: true,
      tokenBalance: 10, // Welcome bonus
      totalEarned: 10,
      engagementScore: 0,
      lastRewardClaim: new Date().toISOString(),
      totalPosts: 0,
      totalLikes: 0,
      totalComments: 0,
      totalShares: 0
    };
    
    addUser(enhancedUser);
    updateState({ currentUser: enhancedUser, currentView: 'feed' });
  }

  const handleViewChange = (view: typeof state.currentView) => {
    updateState({ 
      currentView: view, 
      selectedUserId: undefined, 
      selectedConversationId: undefined,
      selectedHashtag: undefined 
    });
  };

  const handleSelectConversation = (conversationId: string) => {
    updateState({ selectedConversationId: conversationId });
  };

  const handleSelectHashtag = (hashtag: string) => {
    updateState({ 
      currentView: 'hashtag', 
      selectedHashtag: hashtag 
    });
  };

  const handleSaveProfile = (updatedUser: User) => {
    updateUser(updatedUser);
    updateState({ currentView: 'profile' });
  };

  const handleSolanaConnect = (solanaData: Omit<typeof solanaState, 'isConnected'>) => {
    if (state.currentUser) {
      const updatedUser = {
        ...state.currentUser,
        solanaAddress: solanaData.publicKey,
        web3Verified: true
      };
      updateUser(updatedUser);
    }
  };

  const handleSolanaDisconnect = () => {
    disconnect();
  };

  return (
    <HelmetProvider>
      <SEOHead />
      <div className="min-h-screen bg-gray-50">
        <Header state={state} onViewChange={handleViewChange} solanaState={solanaState} />
        
        <main>
          {state.currentView === 'feed' && (
            <Feed 
              state={state} 
              onAddPost={addPost} 
              onToggleLike={toggleLike}
              onRetweet={addRetweet}
              onAddComment={addComment}
              onLikeComment={toggleCommentLike}
              onDislikeComment={toggleCommentDislike}
              onSelectHashtag={handleSelectHashtag}
              onToggleFollow={toggleFollow}
            />
          )}
          
          {state.currentView === 'profile' && (
            <Profile 
              state={state} 
              onToggleFollow={toggleFollow}
              onViewChange={handleViewChange}
            />
          )}
          
          {state.currentView === 'edit-profile' && (
            <EditProfile
              user={state.currentUser}
              onSave={handleSaveProfile}
              onCancel={() => updateState({ currentView: 'profile' })}
            />
          )}
          
          {state.currentView === 'hashtag' && (
            <HashtagSearch
              state={state}
              onSelectHashtag={handleSelectHashtag}
              onFollowHashtag={followHashtag}
            />
          )}
          
          {state.currentView === 'messages' && (
            <Messages 
              state={state} 
              onSendMessage={sendMessage}
              onSelectConversation={handleSelectConversation}
            />
          )}
          
          {state.currentView === 'notifications' && (
            <Notifications
              state={state}
              onMarkAsRead={markNotificationAsRead}
              onMarkAllAsRead={markAllNotificationsAsRead}
            />
          )}

          {state.currentView === 'creator-dashboard' && (
            <CreatorDashboard
              state={state}
              onWithdrawTokens={withdrawTokens}
              onClaimRewards={claimAllRewards}
            />
          )}
          
          {state.currentView === 'settings' && (
            <Settings 
              state={state} 
              onUpdateState={updateState}
              solanaState={solanaState}
              onSolanaConnect={handleSolanaConnect}
              onSolanaDisconnect={handleSolanaDisconnect}
            />
          )}
        </main>
      </div>
    </HelmetProvider>
  );
}

export default App;