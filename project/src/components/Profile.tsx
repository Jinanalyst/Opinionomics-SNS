import React from 'react';
import { Calendar, Users, UserPlus, UserMinus, Shield, Key, MapPin, Globe, Twitter, Github, Linkedin, Edit } from 'lucide-react';
import { AppState } from '../types';

interface ProfileProps {
  state: AppState;
  onToggleFollow: (userId: string) => void;
  onViewChange: (view: AppState['currentView']) => void;
}

export const Profile: React.FC<ProfileProps> = ({ state, onToggleFollow, onViewChange }) => {
  const { currentUser, users, posts } = state;
  const profileUser = state.selectedUserId 
    ? users.find(u => u.id === state.selectedUserId) 
    : currentUser;

  if (!profileUser || !currentUser) return null;

  const userPosts = posts.filter(p => p.authorId === profileUser.id);
  const isOwnProfile = profileUser.id === currentUser.id;
  const isFollowing = currentUser.following.includes(profileUser.id);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="h-32 bg-gradient-to-r from-purple-600 to-indigo-600"></div>
        <div className="relative px-6 pb-6">
          <div className="flex items-end justify-between -mt-16">
            <img
              src={profileUser.avatar}
              alt={profileUser.displayName}
              className="w-32 h-32 rounded-full border-4 border-white object-cover"
            />
            <div className="flex space-x-2">
              {isOwnProfile ? (
                <button
                  onClick={() => onViewChange('edit-profile')}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <button
                  onClick={() => onToggleFollow(profileUser.id)}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                    isFollowing
                      ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700'
                  }`}
                >
                  {isFollowing ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  <span>{isFollowing ? 'Unfollow' : 'Follow'}</span>
                </button>
              )}
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{profileUser.displayName}</h1>
              {profileUser.verified && (
                <Shield className="w-5 h-5 text-blue-500" />
              )}
            </div>
            <p className="text-gray-600 mb-3">@{profileUser.username}</p>
            {profileUser.bio && (
              <p className="text-gray-900 mb-4">{profileUser.bio}</p>
            )}
            
            {/* Location and Website */}
            <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
              {profileUser.location && profileUser.privacySettings.showLocation && (
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{profileUser.location}</span>
                </div>
              )}
              {profileUser.website && profileUser.privacySettings.showWebsite && (
                <div className="flex items-center space-x-1">
                  <Globe className="w-4 h-4" />
                  <a 
                    href={profileUser.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:underline"
                  >
                    {profileUser.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Joined {formatDate(profileUser.createdAt)}</span>
              </div>
            </div>

            {/* Social Links */}
            {profileUser.socialLinks && (
              <div className="flex items-center space-x-4 mb-4">
                {profileUser.socialLinks.twitter && (
                  <a
                    href={`https://twitter.com/${profileUser.socialLinks.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-blue-500 transition-colors"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                )}
                {profileUser.socialLinks.github && (
                  <a
                    href={`https://github.com/${profileUser.socialLinks.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <Github className="w-5 h-5" />
                  </a>
                )}
                {profileUser.socialLinks.linkedin && (
                  <a
                    href={`https://linkedin.com/in/${profileUser.socialLinks.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}
              </div>
            )}
            
            <div className="flex items-center space-x-6 text-sm mb-4">
              <div className="flex items-center space-x-1">
                <span className="font-semibold text-gray-900">{profileUser.following.length}</span>
                <span className="text-gray-600">Following</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="font-semibold text-gray-900">{profileUser.followers.length}</span>
                <span className="text-gray-600">Followers</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="font-semibold text-gray-900">{userPosts.length}</span>
                <span className="text-gray-600">Posts</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="font-semibold text-gray-900">{profileUser.followedHashtags.length}</span>
                <span className="text-gray-600">Hashtags</span>
              </div>
            </div>

            {/* Cryptographic Identity */}
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Key className="w-3 h-3" />
              <span className="font-mono">
                {profileUser.publicKey.substring(0, 16)}...
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {userPosts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-600">
              {isOwnProfile ? "Share your thoughts with the world!" : "This user hasn't posted anything yet."}
            </p>
          </div>
        ) : (
          userPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex space-x-3">
                <img
                  src={profileUser.avatar}
                  alt={profileUser.displayName}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-medium text-gray-900">{profileUser.displayName}</span>
                    <span className="text-gray-500">@{profileUser.username}</span>
                    <span className="text-gray-400">·</span>
                    <span className="text-gray-500 text-sm">
                      {new Date(post.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-900 leading-relaxed mb-3">{post.content}</p>
                  
                  {post.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.hashtags.map((tag) => (
                        <span
                          key={tag}
                          className="text-purple-600 text-sm hover:underline cursor-pointer"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};