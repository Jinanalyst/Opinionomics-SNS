import React, { useState } from 'react';
import { Heart, MessageCircle, MoreHorizontal, Reply, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp } from 'lucide-react';
import { Comment, User } from '../types';

interface CommentSystemProps {
  comments: Comment[];
  users: User[];
  currentUserId: string;
  onAddComment: (content: string, parentId?: string) => void;
  onLikeComment: (commentId: string) => void;
  onDislikeComment: (commentId: string) => void;
  sortBy: 'newest' | 'oldest' | 'most-liked';
  onSortChange: (sort: 'newest' | 'oldest' | 'most-liked') => void;
}

export const CommentSystem: React.FC<CommentSystemProps> = ({
  comments,
  users,
  currentUserId,
  onAddComment,
  onLikeComment,
  onDislikeComment,
  sortBy,
  onSortChange
}) => {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());

  const sortComments = (comments: Comment[]) => {
    return [...comments].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case 'oldest':
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        case 'most-liked':
          return b.likes.length - a.likes.length;
        default:
          return 0;
      }
    });
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    onAddComment(newComment);
    setNewComment('');
  };

  const handleSubmitReply = (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    
    onAddComment(replyContent, parentId);
    setReplyContent('');
    setReplyingTo(null);
  };

  const toggleExpanded = (commentId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedComments(newExpanded);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h`;
    return `${Math.floor(minutes / 1440)}d`;
  };

  const renderComment = (comment: Comment, depth = 0) => {
    const author = users.find(u => u.id === comment.authorId);
    if (!author) return null;

    const hasLiked = comment.likes.includes(currentUserId);
    const hasDisliked = comment.dislikes.includes(currentUserId);
    const isExpanded = expandedComments.has(comment.id);
    const hasReplies = comment.replies.length > 0;

    return (
      <div key={comment.id} className={`${depth > 0 ? 'ml-8 border-l-2 border-gray-100 pl-4' : ''}`}>
        <div className="flex space-x-3 py-4">
          <img
            src={author.avatar}
            alt={author.displayName}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-medium text-gray-900 text-sm">{author.displayName}</span>
              <span className="text-gray-500 text-sm">@{author.username}</span>
              <span className="text-gray-400">·</span>
              <span className="text-gray-500 text-sm">{formatTimestamp(comment.timestamp)}</span>
            </div>
            
            <p className="text-gray-900 text-sm mb-3 leading-relaxed">{comment.content}</p>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => onLikeComment(comment.id)}
                className={`flex items-center space-x-1 text-xs transition-colors ${
                  hasLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
                }`}
              >
                <ThumbsUp className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
                <span>{comment.likes.length}</span>
              </button>
              
              <button
                onClick={() => onDislikeComment(comment.id)}
                className={`flex items-center space-x-1 text-xs transition-colors ${
                  hasDisliked ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
                }`}
              >
                <ThumbsDown className={`w-4 h-4 ${hasDisliked ? 'fill-current' : ''}`} />
                <span>{comment.dislikes.length}</span>
              </button>
              
              <button
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="flex items-center space-x-1 text-xs text-gray-500 hover:text-purple-600 transition-colors"
              >
                <Reply className="w-4 h-4" />
                <span>Reply</span>
              </button>
              
              {hasReplies && (
                <button
                  onClick={() => toggleExpanded(comment.id)}
                  className="flex items-center space-x-1 text-xs text-gray-500 hover:text-purple-600 transition-colors"
                >
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  <span>{comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}</span>
                </button>
              )}
            </div>
            
            {/* Reply Form */}
            {replyingTo === comment.id && (
              <form onSubmit={(e) => handleSubmitReply(e, comment.id)} className="mt-3">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write a reply..."
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={!replyContent.trim()}
                    className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reply
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
        
        {/* Nested Replies */}
        {hasReplies && isExpanded && (
          <div className="mt-2">
            {sortComments(comment.replies).map(reply => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const topLevelComments = comments.filter(c => !c.parentId);
  const sortedComments = sortComments(topLevelComments);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Comments ({comments.length})
        </h3>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as any)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="most-liked">Most liked</option>
        </select>
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmitComment} className="mb-6">
        <div className="flex space-x-3">
          <img
            src={users.find(u => u.id === currentUserId)?.avatar}
            alt="Your avatar"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={3}
            />
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Comment
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-1 divide-y divide-gray-100">
        {sortedComments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No comments yet</p>
            <p className="text-sm text-gray-400">Be the first to share your thoughts!</p>
          </div>
        ) : (
          sortedComments.map(comment => renderComment(comment))
        )}
      </div>
    </div>
  );
};