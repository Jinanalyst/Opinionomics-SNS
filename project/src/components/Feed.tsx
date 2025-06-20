import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Plus, Heart, Repeat2, MessageCircle, Share, Hash, Quote, X, Verified, Image as ImageIcon, File as FileIcon } from 'lucide-react';
import { AppState, Post } from '../types';
import { generatePostId } from '../utils/crypto';
import { CommentSystem } from './CommentSystem';
import { RetweetModal } from './RetweetModal';
import { IPFSStatus } from './IPFSStatus';
import { FollowButton } from './FollowButton';

interface FeedProps {
  state: AppState;
  onAddPost: (post: Post) => void;
  onToggleLike: (postId: string) => void;
  onRetweet: (postId: string, comment?: string, type?: 'direct' | 'quote') => void;
  onAddComment: (postId: string, content: string, parentId?: string) => void;
  onLikeComment: (postId: string, commentId: string) => void;
  onDislikeComment: (postId: string, commentId: string) => void;
  onSelectHashtag: (hashtag: string) => void;
  onToggleFollow: (userId: string) => void;
}

export const Feed: React.FC<FeedProps> = ({ 
  state, 
  onAddPost, 
  onToggleLike, 
  onRetweet,
  onAddComment,
  onLikeComment,
  onDislikeComment,
  onSelectHashtag,
  onToggleFollow
}) => {
  const [newPost, setNewPost] = useState('');
  const [showComposer, setShowComposer] = useState(false);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [retweetModal, setRetweetModal] = useState<string | null>(null);
  const [commentSort, setCommentSort] = useState<'newest' | 'oldest' | 'most-liked'>('newest');
  const [showHashtagSuggestions, setShowHashtagSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim() || !state.currentUser || isPosting) return;

    setIsPosting(true);

    const allHashtags = [...new Set([...selectedHashtags, ...(newPost.match(/#\w+/g) || []).map(tag => tag.substring(1))])];
    const mentions = newPost.match(/@\w+/g) || [];
    
    let mediaUrl: string | undefined = undefined;
    if (filePreview && selectedFile) {
      mediaUrl = filePreview;
    }

    const post: Post = {
      id: generatePostId(),
      authorId: state.currentUser.id,
      content: newPost,
      timestamp: new Date().toISOString(),
      likes: [],
      reposts: [],
      comments: [],
      hashtags: allHashtags,
      mentions: mentions.map(mention => mention.substring(1)),
      rewardPoints: 0,
      qualityScore: 0,
      engagementMultiplier: 1,
      viralBonus: 0,
      ...(mediaUrl ? { mediaUrl } : {})
    };

    try {
      await onAddPost(post);
      setNewPost('');
      setSelectedHashtags([]);
      setShowComposer(false);
      setShowHashtagSuggestions(false);
      setSelectedFile(null);
      setFilePreview(null);
    } catch (error) {
      console.error('Failed to post:', error);
    } finally {
      setIsPosting(false);
    }
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

  const getHashtagSuggestions = (text: string, position: number) => {
    const beforeCursor = text.substring(0, position);
    const words = beforeCursor.split(/\s+/);
    const lastWord = words[words.length - 1] || '';
    
    if (!lastWord.startsWith('#') || lastWord.length < 2) return [];
    
    const searchTerm = lastWord.substring(1).toLowerCase();
    return state.hashtags
      .filter(h => h.tag.toLowerCase().includes(searchTerm) && !selectedHashtags.includes(h.tag))
      .slice(0, 8)
      .map(h => ({ ...h, searchTerm }));
  };

  const suggestions = useMemo(() => 
    getHashtagSuggestions(newPost, cursorPosition), 
    [newPost, cursorPosition, state.hashtags, selectedHashtags]
  );

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const position = e.target.selectionStart;
    
    setNewPost(value);
    setCursorPosition(position);
    
    const beforeCursor = value.substring(0, position);
    const lastWord = beforeCursor.split(/\s+/).pop() || '';
    
    setShowHashtagSuggestions(lastWord.startsWith('#') && lastWord.length > 1);
  };

  const insertHashtag = (hashtag: string) => {
    const beforeCursor = newPost.substring(0, cursorPosition);
    const afterCursor = newPost.substring(cursorPosition);
    const words = beforeCursor.split(/\s+/);
    
    words[words.length - 1] = `#${hashtag}`;
    const newText = words.join(' ') + ' ' + afterCursor;
    
    setNewPost(newText);
    setShowHashtagSuggestions(false);
    
    setTimeout(() => {
      if (textareaRef.current) {
        const newPosition = words.join(' ').length + 1;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newPosition, newPosition);
        setCursorPosition(newPosition);
      }
    }, 0);
  };

  const addSelectedHashtag = (hashtag: string) => {
    if (!selectedHashtags.includes(hashtag)) {
      setSelectedHashtags([...selectedHashtags, hashtag]);
    }
  };

  const removeSelectedHashtag = (hashtag: string) => {
    setSelectedHashtags(selectedHashtags.filter(h => h !== hashtag));
  };

  const getTrendingHashtags = () => {
    return state.hashtags
      .filter(h => h.trending)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const feedPosts = state.posts.filter(post => {
    const author = state.users.find(u => u.id === post.authorId);
    return author && (
      post.authorId === state.currentUser?.id ||
      state.currentUser?.following.includes(post.authorId) ||
      state.currentUser?.followedHashtags.some(tag => post.hashtags.includes(tag))
    );
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const renderPost = (post: Post) => {
    const author = state.users.find(u => u.id === post.authorId);
    if (!author) return null;

    const hasLiked = post.likes.includes(state.currentUser?.id || '');
    const hasRetweeted = post.reposts.some(r => r.userId === state.currentUser?.id);
    const isExpanded = expandedPost === post.id;
    const isOwnPost = post.authorId === state.currentUser?.id;
    const isFollowing = state.currentUser?.following.includes(author.id) || false;

    const originalPost = post.originalPostId ? state.posts.find(p => p.id === post.originalPostId) : null;
    const originalAuthor = originalPost ? state.users.find(u => u.id === originalPost.authorId) : null;

    return (
      <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        {/* Retweet indicator */}
        {originalPost && originalAuthor && (
          <div className="flex items-center space-x-2 mb-3 text-gray-500 text-sm">
            <Repeat2 className="w-4 h-4" />
            <span>{author.displayName} retweeted</span>
          </div>
        )}

        <div className="flex space-x-3">
          <img
            src={(originalAuthor || author).avatar}
            alt={(originalAuthor || author).displayName}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-100 hover:ring-purple-200 transition-all cursor-pointer"
            onClick={() => window.location.hash = `profile/${(originalAuthor || author).id}`}
          />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-900 hover:text-purple-600 cursor-pointer transition-colors">
                  {(originalAuthor || author).displayName}
                </span>
                <span className="text-gray-500">@{(originalAuthor || author).username}</span>
                {(originalAuthor || author).web3Verified && (
                  <Verified className="w-4 h-4 text-blue-500" />
                )}
                <span className="text-gray-400">·</span>
                <span className="text-gray-500 text-sm">{formatTimestamp((originalPost || post).timestamp)}</span>
              </div>
              
              {/* Follow Button */}
              {!isOwnPost && (
                <FollowButton
                  isFollowing={isFollowing}
                  followerCount={author.followers.length}
                  onToggleFollow={() => onToggleFollow(author.id)}
                  size="sm"
                  variant="secondary"
                  showCount={false}
                />
              )}
            </div>

            {/* Retweet comment */}
            {post.retweetComment && (
              <p className="text-gray-900 mb-3 leading-relaxed">{post.retweetComment}</p>
            )}

            {/* Original content */}
            <div className={originalPost ? 'border border-gray-200 rounded-lg p-4 bg-gray-50' : ''}>
              <p className="text-gray-900 mb-4 leading-relaxed">
                {(originalPost || post).content.split(/(\s+)/).map((word, index) => {
                  if (word.startsWith('#')) {
                    return (
                      <button
                        key={index}
                        onClick={() => onSelectHashtag(word.substring(1))}
                        className="text-purple-600 hover:underline font-medium transition-colors"
                      >
                        {word}
                      </button>
                    );
                  }
                  if (word.startsWith('@')) {
                    return (
                      <span key={index} className="text-blue-600 font-medium">
                        {word}
                      </span>
                    );
                  }
                  return word;
                })}
              </p>
              
              {(originalPost || post).hashtags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {(originalPost || post).hashtags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => onSelectHashtag(tag)}
                      className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full hover:bg-purple-200 transition-colors cursor-pointer"
                    >
                      <Hash className="w-3 h-3 mr-1" />
                      {tag}
                    </button>
                  ))}
                </div>
              )}

              {/* IPFS Status */}
              <IPFSStatus
                ipfsHash={(originalPost || post).ipfsHash}
                txHash={(originalPost || post).txHash}
                web3Verified={(originalPost || post).web3Verified}
                chainId={1}
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
              <button
                onClick={() => onToggleLike(post.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  hasLiked
                    ? 'text-red-600 bg-red-50 hover:bg-red-100 shadow-sm'
                    : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                }`}
              >
                <Heart className={`w-5 h-5 ${hasLiked ? 'fill-current' : ''}`} />
                <span className="text-sm font-medium">{post.likes.length}</span>
              </button>
              
              <button
                onClick={() => setRetweetModal(post.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  hasRetweeted
                    ? 'text-green-600 bg-green-50 hover:bg-green-100 shadow-sm'
                    : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                }`}
              >
                <Repeat2 className="w-5 h-5" />
                <span className="text-sm font-medium">{post.reposts.length}</span>
              </button>
              
              <button
                onClick={() => setExpandedPost(isExpanded ? null : post.id)}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm font-medium">{post.comments.length}</span>
              </button>
              
              <button className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200">
                <Share className="w-5 h-5" />
              </button>
            </div>

            {/* Comments Section */}
            {isExpanded && (
              <div className="mt-6">
                <CommentSystem
                  comments={post.comments}
                  users={state.users}
                  currentUserId={state.currentUser?.id || ''}
                  onAddComment={(content, parentId) => onAddComment(post.id, content, parentId)}
                  onLikeComment={(commentId) => onLikeComment(post.id, commentId)}
                  onDislikeComment={(commentId) => onDislikeComment(post.id, commentId)}
                  sortBy={commentSort}
                  onSortChange={setCommentSort}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Solana Status Banner */}
      {state.solana.isConnected && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-4 mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-900">
              Solana Connected - Posts will be stored on IPFS and verified on-chain
            </span>
          </div>
        </div>
      )}

      {/* Post Composer */}
      {!showComposer ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 hover:shadow-md transition-shadow">
          <button
            onClick={() => setShowComposer(true)}
            className="w-full text-left text-gray-500 bg-gray-50 rounded-lg px-4 py-3 hover:bg-gray-100 transition-colors flex items-center space-x-3"
          >
            <img
              src={state.currentUser?.avatar}
              alt="Your avatar"
              className="w-8 h-8 rounded-full ring-2 ring-purple-100"
            />
            <span>What's your opinion on Solana today?</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <form onSubmit={handleSubmitPost}>
            <div className="flex space-x-3">
              <img
                src={state.currentUser?.avatar}
                alt="Your avatar"
                className="w-10 h-10 rounded-full ring-2 ring-purple-100"
              />
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={newPost}
                  onChange={handleTextChange}
                  onSelect={(e) => setCursorPosition(e.currentTarget.selectionStart)}
                  placeholder="Share your thoughts on the decentralized web..."
                  className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  rows={3}
                  autoFocus
                  disabled={isPosting}
                />
                
                {/* Hashtag Suggestions Dropdown */}
                {showHashtagSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                    <div className="p-2 border-b border-gray-100">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Suggested Hashtags</p>
                    </div>
                    {suggestions.map((hashtag) => (
                      <button
                        key={hashtag.tag}
                        type="button"
                        onClick={() => insertHashtag(hashtag.tag)}
                        className="w-full px-3 py-2 text-left hover:bg-purple-50 transition-colors flex items-center justify-between group"
                      >
                        <div className="flex items-center space-x-2">
                          <Hash className="w-4 h-4 text-purple-600" />
                          <span className="font-medium text-gray-900">
                            {hashtag.tag}
                          </span>
                          {hashtag.trending && (
                            <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs font-medium rounded-full">
                              Trending
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-500 group-hover:text-purple-600">
                          {hashtag.count} posts
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Selected Hashtags */}
                {selectedHashtags.length > 0 && (
                  <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                    <p className="text-xs font-medium text-purple-700 mb-2">Selected Hashtags:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedHashtags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full"
                        >
                          <Hash className="w-3 h-3 mr-1" />
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeSelectedHashtag(tag)}
                            className="ml-2 text-purple-500 hover:text-purple-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trending Hashtags Quick Add */}
                {getTrendingHashtags().length > 0 && (
                  <div className="mt-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
                    <p className="text-xs font-medium text-orange-700 mb-2 flex items-center">
                      <Hash className="w-3 h-3 mr-1" />
                      Trending Now - Click to add:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {getTrendingHashtags().map((hashtag) => (
                        <button
                          key={hashtag.tag}
                          type="button"
                          onClick={() => addSelectedHashtag(hashtag.tag)}
                          disabled={selectedHashtags.includes(hashtag.tag)}
                          className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full hover:bg-orange-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          #{hashtag.tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  {/* Upload Button */}
                  <label className="cursor-pointer flex items-center" title="Attach image">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                      disabled={isPosting}
                    />
                    <ImageIcon className="w-5 h-5 text-gray-400 hover:text-purple-600 transition-colors" />
                  </label>
                  {/* Post Button */}
                  <button
                    type="submit"
                    disabled={!newPost.trim() || newPost.length > 280 || isPosting}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isPosting ? 'Posting...' : 'Post'}</span>
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* File Preview */}
          {filePreview && (
            <div className="mt-2 flex items-center space-x-2">
              <img src={filePreview} alt="preview" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
              <button
                type="button"
                onClick={() => { setSelectedFile(null); setFilePreview(null); }}
                className="ml-2 text-gray-400 hover:text-red-500"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Feed */}
      <div className="space-y-4">
        {feedPosts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your feed is empty</h3>
            <p className="text-gray-600 mb-4">Follow other users or hashtags to see posts!</p>
          </div>
        ) : (
          feedPosts.map(renderPost)
        )}
      </div>

      {/* Retweet Modal */}
      {retweetModal && (
        <RetweetModal
          post={state.posts.find(p => p.id === retweetModal)!}
          author={state.users.find(u => u.id === state.posts.find(p => p.id === retweetModal)?.authorId)!}
          currentUser={state.currentUser!}
          onRetweet={onRetweet}
          onClose={() => setRetweetModal(null)}
        />
      )}
    </div>
  );
};