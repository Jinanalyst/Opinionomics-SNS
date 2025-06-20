import React, { useState } from 'react';
import { X, Repeat2, Quote } from 'lucide-react';
import { Post, User } from '../types';

interface RetweetModalProps {
  post: Post;
  author: User;
  currentUser: User;
  onRetweet: (postId: string, comment?: string, type?: 'direct' | 'quote') => void;
  onClose: () => void;
}

export const RetweetModal: React.FC<RetweetModalProps> = ({
  post,
  author,
  currentUser,
  onRetweet,
  onClose
}) => {
  const [comment, setComment] = useState('');
  const [retweetType, setRetweetType] = useState<'direct' | 'quote'>('direct');

  const handleRetweet = () => {
    onRetweet(post.id, retweetType === 'quote' ? comment : undefined, retweetType);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Retweet</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Retweet Type Selection */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setRetweetType('direct')}
              className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                retweetType === 'direct'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Repeat2 className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-gray-900">Retweet</span>
              </div>
              <p className="text-sm text-gray-600">Share instantly</p>
            </button>
            
            <button
              onClick={() => setRetweetType('quote')}
              className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                retweetType === 'quote'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Quote className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-gray-900">Quote Tweet</span>
              </div>
              <p className="text-sm text-gray-600">Add your thoughts</p>
            </button>
          </div>

          {/* Quote Tweet Comment */}
          {retweetType === 'quote' && (
            <div className="mb-6">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>
          )}

          {/* Original Post Preview */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex space-x-3">
              <img
                src={author.avatar}
                alt={author.displayName}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-medium text-gray-900">{author.displayName}</span>
                  <span className="text-gray-500">@{author.username}</span>
                </div>
                <p className="text-gray-900 leading-relaxed">{post.content}</p>
                {post.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {post.hashtags.map((tag) => (
                      <span key={tag} className="text-purple-600 text-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleRetweet}
            disabled={retweetType === 'quote' && !comment.trim()}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Repeat2 className="w-4 h-4" />
            <span>{retweetType === 'direct' ? 'Retweet' : 'Quote Tweet'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};