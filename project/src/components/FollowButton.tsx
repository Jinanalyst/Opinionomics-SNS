import React, { useState } from 'react';
import { UserPlus, UserMinus, Users } from 'lucide-react';

interface FollowButtonProps {
  isFollowing: boolean;
  followerCount: number;
  onToggleFollow: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'minimal';
  showCount?: boolean;
  disabled?: boolean;
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  isFollowing,
  followerCount,
  onToggleFollow,
  size = 'md',
  variant = 'primary',
  showCount = true,
  disabled = false
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const getButtonClasses = () => {
    const baseClasses = `
      inline-flex items-center space-x-2 rounded-lg font-medium transition-all duration-200 
      transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
      disabled:transform-none
    `;

    if (variant === 'minimal') {
      return `${baseClasses} ${sizeClasses[size]} text-gray-600 hover:text-purple-600 hover:bg-purple-50`;
    }

    if (isFollowing) {
      if (isHovered) {
        return `${baseClasses} ${sizeClasses[size]} bg-red-500 text-white hover:bg-red-600 shadow-lg`;
      }
      return `${baseClasses} ${sizeClasses[size]} bg-gray-200 text-gray-800 hover:bg-red-500 hover:text-white shadow-md`;
    }

    return `${baseClasses} ${sizeClasses[size]} bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl`;
  };

  const getIcon = () => {
    if (variant === 'minimal') {
      return <Users className="w-4 h-4" />;
    }
    
    if (isFollowing && isHovered) {
      return <UserMinus className="w-4 h-4" />;
    }
    
    return isFollowing ? <Users className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />;
  };

  const getButtonText = () => {
    if (variant === 'minimal') {
      return showCount ? followerCount.toLocaleString() : '';
    }
    
    if (isFollowing) {
      return isHovered ? 'Unfollow' : 'Following';
    }
    
    return 'Follow';
  };

  return (
    <button
      onClick={onToggleFollow}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={disabled}
      className={getButtonClasses()}
      title={isFollowing ? 'Unfollow user' : 'Follow user'}
    >
      {getIcon()}
      <span>{getButtonText()}</span>
      {showCount && variant !== 'minimal' && (
        <span className="text-xs opacity-75">
          ({followerCount.toLocaleString()})
        </span>
      )}
    </button>
  );
};